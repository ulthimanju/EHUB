package com.example.aiservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aiservice.service.GeminiService;
import com.example.common.dto.ApiResponse;
import com.example.common.dto.EvaluationRequestDto;
import com.example.common.dto.EvaluationResponseDto;

@RestController
@RequestMapping("/ai")
public class AiController {

    private final GeminiService geminiService;

    public AiController(GeminiService geminiService) {
        this.geminiService = geminiService;
    }

    @PostMapping("/evaluate")
    public ResponseEntity<ApiResponse<EvaluationResponseDto>> evaluate(@RequestBody EvaluationRequestDto request) {
        EvaluationResponseDto response = geminiService.evaluate(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
