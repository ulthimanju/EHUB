package com.example.eventservice.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
public class NotificationClient {

    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://notification-service:8080}")
    private String notificationServiceUrl;

    public NotificationClient() {
        this.restTemplate = new RestTemplate();
    }

    public boolean sendEmail(String to, String subject, String body) {
        try {
            Map<String, String> request = new HashMap<>();
            request.put("to", to);
            request.put("subject", subject);
            request.put("body", body);

            String url = notificationServiceUrl + "/notifications/email";
            restTemplate.postForEntity(url, request, String.class);
            System.out.println("Email sent successfully to " + to);
            return true;
        } catch (Exception e) {
            System.err.println("Failed to send email to " + to + ": " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    public void sendTeamInvitation(String email, String teamName, String teamCode, String leaderName) {
        String subject = "Invitation to join team: " + teamName;
        String body = String.format("You have been invited by %s to join the team '%s'.\n\nUse this code to join: %s",
                leaderName, teamName, teamCode);
        sendEmail(email, subject, body);
    }

    public void sendJoinRequestNotification(String leaderEmail, String requesterName, String teamName) {
        String subject = "New Join Request for team: " + teamName;
        String body = String.format(
                "%s has requested to join your team '%s'.\nPlease log in to approve or reject the request.",
                requesterName, teamName);
        sendEmail(leaderEmail, subject, body);
    }

    public void sendRequestStatusUpdate(String userEmail, String teamName, String status) {
        String subject = "Join Request " + status;
        String body = String.format("Your request to join team '%s' has been %s.", teamName, status);
        sendEmail(userEmail, subject, body);
    }
}
