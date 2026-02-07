package com.ehub.ai;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiService aiService;

    @PostMapping("/evaluate/{teamId}")
    public ResponseEntity<Double> evaluateTeam(@PathVariable String teamId) {
        return ResponseEntity.ok(aiService.evaluateTeam(teamId));
    }

    @PostMapping("/evaluate-event/{eventId}")
    public ResponseEntity<String> evaluateEvent(@PathVariable String eventId) {
        try {
            aiService.queueEventEvaluation(eventId);
            return ResponseEntity.ok("Evaluation queued for event: " + eventId);
        } catch (RuntimeException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        }
    }
}
