package com.example.userservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserRegistrationDto;
import com.example.userservice.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserDTO> registerUser(@RequestBody UserRegistrationDto registrationDto) {
        return ResponseEntity.ok(userService.registerUser(registrationDto));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String username = principal.getName();
        String email = null;
        String firstName = null;
        String lastName = null;

        if (principal instanceof org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken) {
            org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken token = (org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken) principal;
            Map<String, Object> attributes = token.getTokenAttributes();

            String preferredUsername = (String) attributes.get("preferred_username");
            if (preferredUsername != null) {
                username = preferredUsername;
            }

            email = (String) attributes.get("email");
            firstName = (String) attributes.get("given_name");
            lastName = (String) attributes.get("family_name");
        }

        return ResponseEntity.ok(userService.syncUser(username, email, firstName, lastName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(userService.updateUser(id, updates));
    }

    @PostMapping("/{id}/roles/organizer")
    public ResponseEntity<UserDTO> promoteToOrganizer(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String otp = payload.get("otp");
        if (otp == null || otp.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        return ResponseEntity.ok(userService.promoteToOrganizer(id, otp));
    }

    @PostMapping("/send-otp")
    public ResponseEntity<Void> sendOtp(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }
        String email = extractEmail(principal);
        if (email == null) {
            // Fallback: fetch user from DB using username if email not in token
            // For now, let's assume email is in token or we can fetch user by username
            String username = principal.getName(); // This is preferred_username or sub
            // We can find user by username and get email
            // But userService.generateAndSendOtp expects email.
            // Let's add a method in userService to send otp by username?
            // OR just user simple extraction for now.
            // Ideally we should look up the user DTO based on principal.

            // Simplest:
            return ResponseEntity.badRequest().build();
        }
        userService.generateAndSendOtp(email);
        return ResponseEntity.ok().build();
    }

    private String extractEmail(java.security.Principal principal) {
        if (principal instanceof org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken) {
            var token = (org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken) principal;
            return (String) token.getTokenAttributes().get("email");
        }
        return null; // Or handle other principal types
    }

    @PatchMapping("/reset-password")
    public ResponseEntity<Void> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("password");
        // Need to find username from email for Keycloak reset, OR implement reset by
        // email in service logic.
        // Let's update UserService.resetPassword to take email and find username
        // internally first.
        userService.resetPassword(email, newPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        userService.generateAndSendOtp(email);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String otp = payload.get("otp");
        try {
            userService.verifyOtp(email, otp);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
