package com.example.userservice.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.common.constants.AppConstants;
import com.example.common.exception.DuplicateEmailException;
import com.example.common.exception.DuplicateUsernameException;
import com.example.common.exception.ResourceNotFoundException;
import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserRegistrationDto;
import com.example.userservice.entity.PendingRegistration;
import com.example.userservice.entity.User;
import com.example.userservice.repository.PendingRegistrationRepository;
import com.example.userservice.repository.UserRepository;

/**
 * Service handling all registration-related workflows.
 * Includes OTP-based registration flow and backward-compatible direct
 * registration.
 * Updated to use Instant-based OTP expiry and BaseEntity auditing.
 */
@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final PendingRegistrationRepository pendingRegistrationRepository;
    private final KeycloakService keycloakService;
    private final OtpService otpService;
    private final NotificationClient notificationClient;

    public RegistrationService(
            UserRepository userRepository,
            PendingRegistrationRepository pendingRegistrationRepository,
            KeycloakService keycloakService,
            OtpService otpService,
            NotificationClient notificationClient) {
        this.userRepository = userRepository;
        this.pendingRegistrationRepository = pendingRegistrationRepository;
        this.keycloakService = keycloakService;
        this.otpService = otpService;
        this.notificationClient = notificationClient;
    }

    /**
     * Step 1: Initiate registration - stores pending registration and sends OTP.
     * 
     * @param registrationDto User registration data
     * @throws DuplicateUsernameException if username already exists
     * @throws DuplicateEmailException    if email already registered
     */
    @Transactional
    public void initiateRegistration(UserRegistrationDto registrationDto) {
        // Check if username or email already exists in confirmed users
        if (userRepository.findByUsername(registrationDto.getUsername()).isPresent()) {
            throw new DuplicateUsernameException(registrationDto.getUsername());
        }
        if (userRepository.findByEmail(registrationDto.getEmail()).isPresent()) {
            throw new DuplicateEmailException(registrationDto.getEmail());
        }

        // Remove any existing pending registration for this email or username
        pendingRegistrationRepository.findByEmail(registrationDto.getEmail())
                .ifPresent(pendingRegistrationRepository::delete);
        pendingRegistrationRepository.findByUsername(registrationDto.getUsername())
                .ifPresent(pendingRegistrationRepository::delete);

        // Generate OTP using centralized service
        String otp = otpService.generateOtp();

        // Create pending registration
        PendingRegistration pending = new PendingRegistration();
        pending.setUsername(registrationDto.getUsername());
        pending.setEmail(registrationDto.getEmail());
        pending.setPassword(registrationDto.getPassword());
        pending.setOtp(otp);
        pending.setOtpExpiry(otpService.getExpiryTime());
        // createdAt is handled by @CreatedDate in BaseEntity via JPA Auditing
        pendingRegistrationRepository.save(pending);

        System.out.println("Registration OTP for " + registrationDto.getEmail() + ": " + otp);

        // Send OTP email using NotificationClient
        notificationClient.sendRegistrationOtpEmail(
                registrationDto.getEmail(),
                otp,
                otpService.getExpiryMinutes());
    }

    /**
     * Step 2: Complete registration - verifies OTP and creates user.
     * 
     * @param email User email
     * @param otp   OTP provided by user
     * @return Created user DTO
     * @throws ResourceNotFoundException if no pending registration found
     */
    @Transactional
    public UserDTO completeRegistration(String email, String otp) {
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("PendingRegistration", "email", email));

        // Verify OTP using centralized service (throws exceptions on failure)
        otpService.verifyOtp(pending.getOtp(), pending.getOtpExpiry(), otp);

        // OTP verified - create user in Keycloak
        UserRegistrationDto registrationDto = new UserRegistrationDto();
        registrationDto.setUsername(pending.getUsername());
        registrationDto.setEmail(pending.getEmail());
        registrationDto.setPassword(pending.getPassword());

        keycloakService.createUser(registrationDto);

        // Assign default role in Keycloak
        try {
            keycloakService.assignRole(pending.getUsername(), AppConstants.ROLE_USER);
        } catch (Exception e) {
            System.err.println("Warning: Could not assign 'USER' role in Keycloak: " + e.getMessage());
        }

        // Create user in local DB
        User user = new User();
        user.setUsername(pending.getUsername());
        user.setEmail(pending.getEmail());
        user.setRole(AppConstants.ROLE_USER);

        User savedUser;
        try {
            savedUser = userRepository.save(user);
        } catch (Exception e) {
            // COMPENSATING TRANSACTION: Rollback Keycloak user creation
            System.err.println("Failed to save user to local DB. Rolling back Keycloak user: " + pending.getUsername());
            try {
                keycloakService.deleteUser(pending.getUsername());
            } catch (Exception ke) {
                System.err.println("CRITICAL: Failed to rollback Keycloak user: " + ke.getMessage());
                // In production, we would log this to a dead-letter queue or alert system
            }
            throw e; // Re-throw to trigger transaction rollback for any other DB changes
        }

        // Remove pending registration
        pendingRegistrationRepository.delete(pending);

        System.out.println("Registration completed for: " + email);
        return mapToDTO(savedUser);
    }

    /**
     * Resend OTP for pending registration.
     * 
     * @param email User email
     * @throws ResourceNotFoundException if no pending registration found
     */
    @Transactional
    public void resendRegistrationOtp(String email) {
        PendingRegistration pending = pendingRegistrationRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("PendingRegistration", "email", email));

        // Generate new OTP
        String otp = otpService.generateOtp();
        pending.setOtp(otp);
        pending.setOtpExpiry(otpService.getExpiryTime());
        pendingRegistrationRepository.save(pending);

        System.out.println("Resent Registration OTP for " + email + ": " + otp);

        // Send OTP email
        notificationClient.sendRegistrationOtpEmail(email, otp, otpService.getExpiryMinutes());
    }

    /**
     * Legacy method: Direct registration without OTP (backward compatibility).
     * 
     * @param registrationDto User registration data
     * @return Created user DTO
     */
    public UserDTO registerUserDirect(UserRegistrationDto registrationDto) {
        // Create user in Keycloak
        keycloakService.createUser(registrationDto);

        // Assign default role in Keycloak
        try {
            keycloakService.assignRole(registrationDto.getUsername(), AppConstants.ROLE_USER);
        } catch (Exception e) {
            System.err.println("Warning: Could not assign 'USER' role in Keycloak: " + e.getMessage());
        }

        // Create user in local DB
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        user.setRole(AppConstants.ROLE_USER);

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    /**
     * Maps User entity to UserDTO.
     */
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
