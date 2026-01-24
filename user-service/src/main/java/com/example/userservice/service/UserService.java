package com.example.userservice.service;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserRegistrationDto;
import com.example.userservice.entity.User;
import com.example.userservice.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final KeycloakService keycloakService;

    public UserService(UserRepository userRepository, KeycloakService keycloakService) {
        this.userRepository = userRepository;
        this.keycloakService = keycloakService;
    }

    public UserDTO registerUser(UserRegistrationDto registrationDto) {
        // 1. Create user in Keycloak
        keycloakService.createUser(registrationDto);

        // 2. Create user in local DB
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        // Password is NOT saved locally

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public UserDTO saveUser(User user) {
        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.example.common.exception.ResourceNotFoundException("User", "id", id));
        return mapToDTO(user);
    }

    public UserDTO updateUser(Long id, Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.example.common.exception.ResourceNotFoundException("User", "id", id));

        updates.forEach((key, value) -> {
            Field field = ReflectionUtils.findField(User.class, key);
            if (field != null) {
                field.setAccessible(true);
                ReflectionUtils.setField(field, user, value);
            }
        });

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public UserDTO syncUser(String username, String email, String firstName, String lastName) {
        return userRepository.findByUsername(username)
                .map(this::mapToDTO)
                .orElseGet(() -> {
                    User user = new User();
                    user.setUsername(username);
                    user.setEmail(email);
                    user.setFirstName(firstName);
                    user.setLastName(lastName);
                    return mapToDTO(userRepository.save(user));
                });
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Reset in Keycloak using username found from DB
        keycloakService.resetPassword(user.getUsername(), newPassword);
    }

    public void generateAndSendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiry(java.time.LocalDateTime.now().plusMinutes(5));
        userRepository.save(user);

        System.out.println("OTP for " + email + ": " + otp);

        // Call Notification Service
        sendEmail(email, "Password Reset OTP", "Your OTP for password reset is: " + otp);
    }

    public void verifyOtp(String email, String otp) {
        System.out.println("Verifying OTP for: " + email + " Code: " + otp);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        if (user.getOtp() == null || user.getOtpExpiry() == null) {
            System.err.println("No OTP requested for " + email);
            throw new RuntimeException("No OTP requested");
        }

        if (java.time.LocalDateTime.now().isAfter(user.getOtpExpiry())) {
            System.err.println("OTP expired for " + email);
            throw new RuntimeException("OTP expired");
        }

        if (!user.getOtp().equals(otp)) {
            System.err.println("Invalid OTP for " + email);
            throw new RuntimeException("Invalid OTP");
        }

        // OTP Verified.
        // We do NOT clear it here if the next step (Reset Password) needs to verify it
        // again or if we treat this as "session verified".
        // However, standard flow is: Verify -> Get Token -> Reset.
        // For this simple implementation where client state handles flow, we can clear
        // it.
        // BUT if the previous 500 was due to "Invalid OTP", let's see.
        // If 500, it's an unhandled exception.
        // Let's wrap in try-catch in controller or just ensure no null pointers here.
        System.out.println("OTP Verified successfully for " + email);

        // Don't clear it yet, let's clear it in resetPassword to prevent replay
        // attacks,
        // OR clear it here and issuing a temporary reset token would be better but
        // complex.
        // For now, let's clear it here.
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            java.util.Map<String, String> request = new java.util.HashMap<>();
            request.put("to", to);
            request.put("subject", subject);
            request.put("body", body);

            // Using API Gateway URL (or internal Docker DNS if within same network)
            // Accessing via API Gateway accessible from within docker network might need to
            // be 'api-gateway' or specific service
            // Here assuming internal communication:
            // http://notification-service:8080/notifications/email
            // If running composed, service name is 'notification-service'.
            String url = "http://notification-service:8080/notifications/email";
            restTemplate.postForEntity(url, request, String.class);
            System.out.println("Email sent successfully to " + to);
        } catch (Exception e) {
            System.err.println("Failed to send email: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private UserDTO mapToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getAddress());
    }
}
