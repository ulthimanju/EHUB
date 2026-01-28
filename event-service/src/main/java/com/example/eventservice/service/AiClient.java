package com.example.eventservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import com.example.common.dto.ApiResponse;
import com.example.common.dto.EvaluationRequestDto;
import com.example.common.dto.EvaluationResponseDto;

@Component
public class AiClient {

    private final RestClient restClient;

    @Value("${ai.service.url:http://ai-service:8085}")
    private String aiServiceUrl;

    public AiClient() {
        this.restClient = RestClient.create();
    }

    public EvaluationResponseDto evaluate(EvaluationRequestDto request) {
        try {
            ResponseEntity<ApiResponse<EvaluationResponseDto>> response = restClient.post()
                    .uri(aiServiceUrl + "/ai/evaluate")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(request)
                    .retrieve()
                    .toEntity(new ParameterizedTypeReference<ApiResponse<EvaluationResponseDto>>() {
                    });

            if (response.getBody() != null && response.getBody().isSuccess()) {
                return response.getBody().getData();
            }
            throw new RuntimeException("AI Service returned failure: " + response.getBody());
        } catch (Exception e) {
            throw new RuntimeException("Failed to call AI Service", e);
        }
    }
}
