package com.ehub.event.client;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class NotificationClient {

    private final RestTemplate restTemplate;

    @Value("${application.notification-service.url}")
    private String baseUrl;

    public void sendEmail(String to, String subject, String message) {
        Map<String, String> emailRequest = new HashMap<>();
        emailRequest.put("to", to);
        emailRequest.put("subject", subject);
        emailRequest.put("message", message);
        
        restTemplate.postForEntity(baseUrl, emailRequest, String.class);
    }
}
