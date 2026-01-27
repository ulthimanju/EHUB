package com.example.userservice.service;

import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

/**
 * HTTP client for communication with the notification-service.
 * Encapsulates all notification-related HTTP calls.
 */
@Component
public class NotificationClient {

    private final RestTemplate restTemplate;

    @Value("${notification.service.url:http://notification-service:8080}")
    private String notificationServiceUrl;

    public NotificationClient() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Sends an email via the notification service.
     * 
     * @param to      Recipient email address
     * @param subject Email subject
     * @param body    Email body content
     * @return true if email was sent successfully, false otherwise
     */
    @io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker(name = "notificationService", fallbackMethod = "sendEmailFallback")
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
            throw e; // Rethrow to trigger Circuit Breaker if needed, or let fallback handle it
        }
    }

    public boolean sendEmailFallback(String to, String subject, String body, Throwable t) {
        System.err.println("Fallback: Failed to send email to " + to + ". Reason: " + t.getMessage());
        return false;
    }

    /**
     * Sends an OTP email for registration verification.
     * 
     * @param email         Recipient email address
     * @param otp           The OTP code
     * @param expiryMinutes How long the OTP is valid
     * @return true if email was sent successfully
     */
    public boolean sendRegistrationOtpEmail(String email, String otp, int expiryMinutes) {
        String subject = "Email Verification OTP";
        String body = String.format(
                "Your OTP for registration is: %s\n\nThis code expires in %d minutes.",
                otp, expiryMinutes);
        return sendEmail(email, subject, body);
    }

    /**
     * Sends an OTP email for password reset.
     * 
     * @param email Recipient email address
     * @param otp   The OTP code
     * @return true if email was sent successfully
     */
    public boolean sendPasswordResetOtpEmail(String email, String otp) {
        String subject = "Password Reset OTP";
        String body = "Your OTP for password reset is: " + otp;
        return sendEmail(email, subject, body);
    }

    /**
     * Sends an OTP email for role upgrade (e.g., becoming organizer).
     * 
     * @param email    Recipient email address
     * @param otp      The OTP code
     * @param roleName The role being upgraded to
     * @return true if email was sent successfully
     */
    public boolean sendRoleUpgradeOtpEmail(String email, String otp, String roleName) {
        String subject = "Role Upgrade Verification OTP";
        String body = String.format(
                "Your OTP to become a %s is: %s\n\nThis code expires in 2 minutes.",
                roleName, otp);
        return sendEmail(email, subject, body);
    }
}
