package com.ehub.notification.controller;

import com.ehub.notification.dto.EmailRequest;
import com.ehub.notification.dto.OtpRequest;
import com.ehub.notification.dto.OtpValidationRequest;
import com.ehub.notification.service.EmailService;
import com.ehub.notification.service.OtpService;
import com.ehub.notification.util.MessageKeys;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final EmailService emailService;
    private final OtpService otpService;

    @PostMapping("/send-alert")
    public ResponseEntity<String> sendAlert(@Valid @RequestBody EmailRequest request) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("message", request.getMessage());
        emailService.sendHtmlEmail(request.getTo(), request.getSubject(), "alert-template", variables);
        return ResponseEntity.ok(MessageKeys.ALERT_SENT_SUCCESS.getMessage());
    }

    @PostMapping("/password-reset/otp")
    public ResponseEntity<String> sendPasswordResetOtp(@Valid @RequestBody OtpRequest request) {
        String otp = otpService.generateOtp(request.getEmail());
        Map<String, Object> variables = new HashMap<>();
        variables.put("otp", otp);
        emailService.sendHtmlEmail(request.getEmail(), "Password Reset OTP", "otp-template", variables);
        return ResponseEntity.ok(MessageKeys.OTP_SENT_SUCCESS.getMessage());
    }

    @PostMapping("/password-reset/validate")
    public ResponseEntity<Boolean> validateOtp(@Valid @RequestBody OtpValidationRequest request) {
        boolean isValid = otpService.validateOtp(request.getEmail(), request.getOtp());
        return ResponseEntity.ok(isValid);
    }
}
