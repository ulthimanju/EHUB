package com.example.userservice.service;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.ReflectionUtils;

import com.example.common.constants.AppConstants;
import com.example.common.exception.ResourceNotFoundException;
import com.example.userservice.dto.UserDTO;
import com.example.userservice.entity.User;
import com.example.userservice.repository.UserRepository;

/**
 * Core User Service - handles user CRUD operations and role management.
 * 
 * Registration logic has been extracted to RegistrationService.
 * Password logic has been extracted to PasswordService.
 * OTP logic has been extracted to OtpService.
 * Email logic has been extracted to NotificationClient.
 */
@Service
public class UserService {

    private final UserRepository userRepository;
    private final KeycloakService keycloakService;
    private final OtpService otpService;
    private final NotificationClient notificationClient;

    public UserService(
            UserRepository userRepository,
            KeycloakService keycloakService,
            OtpService otpService,
            NotificationClient notificationClient) {
        this.userRepository = userRepository;
        this.keycloakService = keycloakService;
        this.otpService = otpService;
        this.notificationClient = notificationClient;
    }

    // ==================== CORE USER OPERATIONS ====================

    public UserDTO saveUser(User user) {
        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return mapToDTO(user);
    }

    public UserDTO updateUser(Long id, Map<String, Object> updates) {
        return userRepository.findById(id)
                .map(user -> applyUpdates(user, updates))
                .map(userRepository::save)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private User applyUpdates(User user, Map<String, Object> updates) {
        updates.forEach((key, value) -> {
            Field field = ReflectionUtils.findField(User.class, key);
            if (field != null) {
                field.setAccessible(true);
                ReflectionUtils.setField(field, user, value);
            }
        });
        return user;
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
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
                    user.setRole(AppConstants.ROLE_USER);
                    return mapToDTO(userRepository.save(user));
                });
    }

    // ==================== ROLE MANAGEMENT ====================

    @Transactional(rollbackFor = Exception.class)
    public UserDTO promoteToOrganizer(Long userId, String otp) {
        return userRepository.findById(userId)
                .map(user -> verifyAndPromote(user, otp))
                .map(this::syncKeycloak)
                .map(this::mapToDTO)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
    }

    private User verifyAndPromote(User user, String otp) {
        // Verify OTP using centralized service - throws exception if invalid
        otpService.verifyOtp(user.getOtp(), user.getOtpExpiry(), otp);

        // Encapsulated update on entity
        user.promoteToOrganizer();

        return user;
    }

    private User syncKeycloak(User user) {
        try {
            keycloakService.assignRole(user.getUsername(), AppConstants.ROLE_ORGANIZER);
        } catch (Exception e) {
            System.err.println("Error assigning ORGANIZER role in Keycloak: " + e.getMessage());
            // Throwing RuntimeException triggers rollback of savedUser
            throw new com.example.common.exception.RolePromotionException(
                    "Failed to promote user in Keycloak: " + e.getMessage(), e);
        }
        return user;
    }

    /**
     * Generates and sends OTP for role upgrade (e.g., becoming organizer).
     */
    @Transactional
    public void generateOtpForRoleUpgrade(Long userId) {
        userRepository.findById(userId)
                .map(this::setOtpForUpgrade)
                .map(userRepository::save)
                .ifPresentOrElse(
                        user -> {
                            System.out.println("Role upgrade OTP for " + user.getEmail() + ": " + user.getOtp());
                            notificationClient.sendRoleUpgradeOtpEmail(user.getEmail(), user.getOtp(),
                                    AppConstants.ROLE_ORGANIZER);
                        },
                        () -> {
                            throw new ResourceNotFoundException("User", "id", userId);
                        });
    }

    private User setOtpForUpgrade(User user) {
        String otp = otpService.generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(otpService.getExpiryTime());
        return user;
    }

    // ==================== MAPPER ====================

    public UserDTO mapToDTO(User user) {
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
