package com.ehub.auth.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component
@RequiredArgsConstructor
public class NotificationClient {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${application.notification-service.url}")
    private String baseUrl;

    public void sendOtp(String email) {
        String url = baseUrl.replace("/validate", "/otp");
        restTemplate.postForObject(url, Map.of("email", email), String.class);
    }

    public boolean validateOtp(String email, String otp) {
        Boolean isValid = restTemplate.postForObject(
                baseUrl,
                Map.of("email", email, "otp", otp),
                Boolean.class
        );
        return Boolean.TRUE.equals(isValid);
    }
}
