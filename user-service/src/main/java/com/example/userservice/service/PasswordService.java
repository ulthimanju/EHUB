package com.example.userservice.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.common.exception.ResourceNotFoundException;
import com.example.userservice.entity.User;
import com.example.userservice.repository.UserRepository;

/**
 * Service handling password-related operations.
 * Includes OTP generation for password reset and password update.
 */
@Service
public class PasswordService {

    private final UserRepository userRepository;
    private final KeycloakService keycloakService;
    private final OtpService otpService;
    private final NotificationClient notificationClient;

    public PasswordService(
            UserRepository userRepository,
            KeycloakService keycloakService,
            OtpService otpService,
            NotificationClient notificationClient) {
        this.userRepository = userRepository;
        this.keycloakService = keycloakService;
        this.otpService = otpService;
        this.notificationClient = notificationClient;
    }

    /**
     * Generates an OTP and sends it to the user's email for password reset.
     * 
     * @param email User's email address
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional
    public void generateAndSendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        String otp = otpService.generateOtp();
        user.setOtp(otp);
        user.setOtpExpiry(otpService.getExpiryTime());
        userRepository.save(user);

        System.out.println("Password reset OTP for " + email + ": " + otp);

        // Send OTP via notification service
        notificationClient.sendPasswordResetOtpEmail(email, otp);
    }

    /**
     * Verifies an OTP for password reset.
     * 
     * @param email User's email address
     * @param otp   OTP provided by user
     * @throws ResourceNotFoundException                             if user not
     *                                                               found
     * @throws com.example.common.exception.OtpNotRequestedException if no OTP was
     *                                                               requested
     * @throws com.example.common.exception.ExpiredOtpException      if OTP expired
     * @throws com.example.common.exception.InvalidOtpException      if OTP is
     *                                                               incorrect
     */
    @Transactional
    public void verifyOtp(String email, String otp) {
        System.out.println("Verifying password reset OTP for: " + email + " Code: " + otp);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Verify OTP using centralized service
        otpService.verifyOtp(user.getOtp(), user.getOtpExpiry(), otp);

        // OTP Verified - clear it
        System.out.println("Password reset OTP verified successfully for " + email);
        user.setOtp(null);
        user.setOtpExpiry(null);
        userRepository.save(user);
    }

    /**
     * Resets the user's password in Keycloak.
     * Should be called after OTP verification.
     * 
     * @param email       User's email address
     * @param newPassword New password to set
     * @throws ResourceNotFoundException if user not found
     */
    @Transactional
    public void resetPassword(String email, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        // Reset in Keycloak using username found from DB
        keycloakService.resetPassword(user.getUsername(), newPassword);

        System.out.println("Password reset completed for: " + email);
    }

    /**
     * Combined method: Verify OTP and reset password in one call.
     * 
     * @param email       User's email address
     * @param otp         OTP provided by user
     * @param newPassword New password to set
     */
    @Transactional
    public void verifyOtpAndResetPassword(String email, String otp, String newPassword) {
        verifyOtp(email, otp);
        resetPassword(email, newPassword);
    }
}
