package com.example.eventservice.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.example.eventservice.entity.ProblemStatement;
import com.example.eventservice.entity.Score;
import com.example.eventservice.entity.Submission;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class GeminiService {

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.model:gemini-1.5-flash}")
    private String modelName;

    public GeminiService(ObjectMapper objectMapper) {
        this.restClient = RestClient.create();
        this.objectMapper = objectMapper;
    }

    public Score evaluate(Submission submission, ProblemStatement problemStatement) {
        String prompt = String.format(
                """
                        You are a judge for a hackathon. Evaluate the following submission based on the problem statement.

                        Problem Statement: %s
                        Description: %s

                        Submission Repository: %s
                        Submission Demo: %s
                        Submission Description: %s

                        Please provide a score from 0 to 10 and a short feedback explaining the score.
                        Return the response in raw JSON format (no markdown code blocks) with fields: "score" (number) and "feedback" (string).
                        """,
                problemStatement.getTitle(),
                problemStatement.getDescription(),
                submission.getRepoUrl(),
                submission.getDemoUrl(),
                submission.getDescription());

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)))));

        String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                modelName, apiKey);

        try {
            String response = restClient.post()
                    .uri(url)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            JsonNode root = objectMapper.readTree(response);
            String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

            // Cleanup markdown if present
            String jsonText = text.replaceAll("```json", "").replaceAll("```", "").trim();
            JsonNode result = objectMapper.readTree(jsonText);

            Score score = new Score();
            score.setScore(result.get("score").asDouble());
            score.setFeedback(result.get("feedback").asText());
            score.setJudgeId("gemini-ai");
            score.setSubmission(submission);

            return score;
        } catch (Exception e) {
            throw new RuntimeException("Failed to evaluate submission with Gemini", e);
        }
    }
}
