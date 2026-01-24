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

        // 1.5 Assign default role in Keycloak
        // We should ensure the role exists in Keycloak or handle the error gracefully
        // if not configured
        try {
            keycloakService.assignRole(registrationDto.getUsername(), "USER");
        } catch (Exception e) {
            System.err.println("Warning: Could not assign 'USER' role in Keycloak: " + e.getMessage());
        }

        // 2. Create user in local DB
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setRole("USER"); // Default role
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

    public UserDTO promoteToOrganizer(Long userId, String otp) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.example.common.exception.ResourceNotFoundException("User", "id", userId));

        // 1. Verify OTP
        // We can reuse verifyOtp method, but it expects email. Since we have user, we
        // get email.
        // verifyOtp will throw exception if invalid.
        verifyOtp(user.getEmail(), otp);

        // 2. Update local
        user.setRole("ORGANIZER");
        User savedUser = userRepository.save(user);

        // 3. Update Keycloak
        try {
            keycloakService.assignRole(user.getUsername(), "ORGANIZER");
        } catch (Exception e) {
            System.err.println("Error assigning ORGANIZER role in Keycloak: " + e.getMessage());
            // Decide if we want to rollback or just log. For now, log.
            throw new RuntimeException("Failed to assign role in Keycloak: " + e.getMessage());
        }

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
                    user.setRole("USER"); // Default for synced users
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
        System.out.println("OTP Verified successfully for " + email);

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
                user.getAddress(),
                user.getRole());
    }
}
