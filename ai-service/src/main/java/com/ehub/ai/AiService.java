package com.ehub.ai;

import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.util.*;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
public class AiService {

    private final RestTemplate restTemplate;
    private final BlockingQueue<Map<String, Object>> evaluationQueue = new LinkedBlockingQueue<>();
    private final AtomicBoolean isBulkEvaluating = new AtomicBoolean(false);

    @Value("${GEMINI_API_KEY}")
    private String geminiApiKey;

    @Value("${APPLICATION_EVENT_SERVICE_URL}")
    private String eventServiceUrl;

    @PostConstruct
    public void startWorker() {
        Thread worker = new Thread(() -> {
            while (true) {
                try {
                    Map<String, Object> context = evaluationQueue.take();
                    processEvaluation(context);
                    
                    // If queue is empty after a task, and we were bulk evaluating, clear the flag
                    if (evaluationQueue.isEmpty()) {
                        isBulkEvaluating.set(false);
                    }
                } catch (InterruptedException e) {
                    Thread.currentThread().interrupt();
                    break;
                } catch (Exception e) {
                    System.err.println("Background worker error: " + e.getMessage());
                }
            }
        });
        worker.setDaemon(true);
        worker.start();
    }

    public void queueEventEvaluation(String eventId) {
        if (isBulkEvaluating.get()) {
            throw new RuntimeException("A bulk evaluation job is already in progress.");
        }

        String url = eventServiceUrl + "/events/teams/event/" + eventId + "/evaluation-context";
        try {
            List<Map<String, Object>> contexts = restTemplate.getForObject(url, List.class);
            if (contexts != null && !contexts.isEmpty()) {
                isBulkEvaluating.set(true);
                evaluationQueue.addAll(contexts);
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch event context: " + e.getMessage());
            throw new RuntimeException("Failed to initiate bulk evaluation: " + e.getMessage());
        }
    }

    public Double evaluateTeam(String teamId) {
        String contextUrl = eventServiceUrl + "/events/teams/" + teamId + "/evaluation-context";
        Map<String, Object> context = restTemplate.getForObject(contextUrl, Map.class);
        if (context == null) return 0.0;
        context.put("teamId", teamId);
        return processEvaluation(context);
    }

    private Double processEvaluation(Map<String, Object> context) {
        String teamId = context.get("teamId").toString();
        String repoUrl = (String) context.get("repoUrl");
        String problemStatement = (String) context.getOrDefault("problemStatement", "No problem statement provided.");
        String teamName = (String) context.get("teamName");

        System.out.println("Processing evaluation for team: " + teamName + " (" + teamId + ")");
        
        try {
            Double score = callGeminiForScore(teamName, problemStatement, repoUrl);
            updateScoreInEventService(teamId, score);
            return score;
        } catch (Exception e) {
            System.err.println("Evaluation failed for team " + teamId + ": " + e.getMessage());
            return 0.0;
        }
    }

    private void updateScoreInEventService(String teamId, Double score) {
        try {
            String scoreUrl = eventServiceUrl + "/events/teams/" + teamId + "/score?score=" + score;
            restTemplate.postForEntity(scoreUrl, null, String.class);
        } catch (Exception e) {
            System.err.println("Failed to update score for team " + teamId + ": " + e.getMessage());
        }
    }

    private Double callGeminiForScore(String teamName, String problemStatement, String repoUrl) {
        try {
            Client client = new Client(); 
            
            String prompt = String.format(
                "Evaluate the following project based on the provided details:\n\n" +
                "Problem Statement: %s\n" +
                "Repository URL: %s\n\n" +
                "Criteria for Evaluation (Total 100%%):\n" +
                "1. Innovation: 20%%\n" +
                "2. Technical Complexity: 20%%\n" +
                "3. Design & Implementation: 20%%\n" +
                "4. Potential Impact: 20%%\n" +
                "5. Theme Fit: 20%%\n\n" +
                "Provide a final score out of 100. Respond ONLY with a JSON object containing a field 'score'.\n" +
                "Example: {\"score\": 82.5}",
                problemStatement, repoUrl
            );

            GenerateContentResponse response = client.models.generateContent(
                "gemini-3-flash-preview", 
                prompt, 
                null
            );

            String text = response.text();
            String jsonStr = text.replaceAll("```json", "").replaceAll("```", "").trim();
            
            if (jsonStr.contains("\"score\":")) {
                String scorePart = jsonStr.split("\"score\":")[1].split("}")[0].trim();
                return Double.parseDouble(scorePart);
            }
        } catch (Exception e) {
            System.err.println("Gemini SDK call failed: " + e.getMessage());
            throw e;
        }
        return 0.0;
    }
}
