package com.example.userservice.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.common.dto.ApiResponse;
import com.example.userservice.service.PasswordService;

/**
 * Controller handling password management workflows.
 * Separated from UserController for Single Responsibility Principle.
 */
@RestController
@RequestMapping("/auth")
public class PasswordController {

    private final PasswordService passwordService;

    public PasswordController(PasswordService passwordService) {
        this.passwordService = passwordService;
    }

    /**
     * Request password reset OTP.
     * 
     * POST /auth/forgot-password
     * Body: { "email": "john@example.com" }
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        passwordService.generateAndSendOtp(email);
        return ResponseEntity.ok(ApiResponse.success("Password reset OTP has been sent to your email."));
    }

    /**
     * Verify OTP for password reset.
     * 
     * POST /auth/verify-otp
     * Body: { "email": "john@example.com", "otp": "123456" }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<Void>> verifyOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        passwordService.verifyOtp(email, otp);
        return ResponseEntity.ok(ApiResponse.success("OTP verified successfully."));
    }

    /**
     * Reset password after OTP verification.
     * 
     * PATCH /auth/reset-password
     * Body: { "email": "john@example.com", "password": "newPassword123" }
     */
    @PatchMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("password");
        passwordService.resetPassword(email, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully."));
    }

    /**
     * Combined endpoint: Verify OTP and reset password in one call.
     * 
     * POST /auth/reset-password-with-otp
     * Body: { "email": "john@example.com", "otp": "123456", "password":
     * "newPassword123" }
     */
    @PostMapping("/reset-password-with-otp")
    public ResponseEntity<ApiResponse<Void>> resetPasswordWithOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        String newPassword = payload.get("password");
        passwordService.verifyOtpAndResetPassword(email, otp, newPassword);
        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully."));
    }
}
