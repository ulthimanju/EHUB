package com.example.eventservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import com.example.common.dto.ApiResponse;
import com.example.eventservice.dto.UserSummaryDto;

@Component
public class UserClient {

    private final RestTemplate restTemplate;

    @Value("${user.service.url:http://user-service:8081}")
    private String userServiceUrl;

    private static final String API_PATH_SEARCH_EMAIL = "/users/search?email=";
    private static final String API_PATH_SEARCH_USERNAME = "/users/search?username=";

    public UserClient() {
        this.restTemplate = new RestTemplate();
    }

    @org.springframework.cache.annotation.Cacheable(value = "users", key = "#email", unless = "#result == null")
    public UserSummaryDto getUserByEmail(String email) {
        try {
            String url = userServiceUrl + API_PATH_SEARCH_EMAIL + email;
            ResponseEntity<ApiResponse<UserSummaryDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponse<UserSummaryDto>>() {
                    });

            if (response.getBody() != null && response.getBody().isSuccess()) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch user by email: " + email + " Error: " + e.getMessage());
        }
        return null;
    }

    @org.springframework.cache.annotation.Cacheable(value = "users", key = "#username", unless = "#result == null")
    public UserSummaryDto getUserByUsername(String username) {
        try {
            String url = userServiceUrl + API_PATH_SEARCH_USERNAME + username;
            ResponseEntity<ApiResponse<UserSummaryDto>> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<ApiResponse<UserSummaryDto>>() {
                    });

            if (response.getBody() != null && response.getBody().isSuccess()) {
                return response.getBody().getData();
            }
        } catch (Exception e) {
            System.err.println("Failed to fetch user by username: " + username + " Error: " + e.getMessage());
        }
        return null;
    }
}
