package com.example.notificationservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.common.dto.ApiResponse;
import com.example.notificationservice.dto.EmailRequest;
import com.example.notificationservice.service.EmailService;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final EmailService emailService;

    public NotificationController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/email")
    public ResponseEntity<ApiResponse<Void>> sendEmail(@RequestBody EmailRequest request) {
        System.out.println("Controller: Received email request for: " + request.getTo());
        // Exceptions will be handled by GlobalExceptionHandler
        emailService.sendEmail(request.getTo(), request.getSubject(), request.getBody());
        return ResponseEntity.ok(ApiResponse.success("Email sent successfully"));
    }
}
