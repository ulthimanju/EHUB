package com.example.userservice.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.common.dto.ApiResponse;
import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserRegistrationDto;
import com.example.userservice.service.RegistrationService;

/**
 * Controller handling user registration workflows.
 * Separated from UserController for Single Responsibility Principle.
 */
@RestController
@RequestMapping("/users/auth")
public class RegistrationController {

    private final RegistrationService registrationService;

    public RegistrationController(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    /**
     * Step 1: Initiate registration - stores pending registration and sends OTP.
     * 
     * POST /auth/register
     * Body: { "username": "john", "email": "john@example.com", "password": "secret"
     * }
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> initiateRegistration(@RequestBody UserRegistrationDto registrationDto) {
        registrationService.initiateRegistration(registrationDto);
        return ResponseEntity.ok(ApiResponse.success("Registration initiated. Please check your email for OTP."));
    }

    /**
     * Step 2: Verify OTP and complete registration.
     * 
     * POST /auth/verify-registration
     * Body: { "email": "john@example.com", "otp": "123456" }
     */
    @PostMapping("/verify-registration")
    public ResponseEntity<ApiResponse<UserDTO>> completeRegistration(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        UserDTO user = registrationService.completeRegistration(email, otp);
        return ResponseEntity.ok(ApiResponse.success(user, "Registration completed successfully."));
    }

    /**
     * Resend registration OTP.
     * 
     * POST /auth/resend-otp
     * Body: { "email": "john@example.com" }
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendRegistrationOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        registrationService.resendRegistrationOtp(email);
        return ResponseEntity.ok(ApiResponse.success("OTP has been resent to your email."));
    }
}
