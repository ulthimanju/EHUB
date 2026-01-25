package com.example.userservice.service;

import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.common.exception.ExpiredOtpException;
import com.example.common.exception.InvalidOtpException;
import com.example.common.exception.OtpNotRequestedException;

/**
 * Centralized OTP management service.
 * Handles OTP generation, expiry calculation, and verification logic.
 * Updated to use Instant for UTC consistency.
 */
@Service
public class OtpService {

    private static final int OTP_LENGTH = 6;
    private static final int OTP_MAX_VALUE = 999999;

    private final SecureRandom secureRandom = new SecureRandom();

    @Value("${otp.expiry.minutes:2}")
    private int otpExpiryMinutes;

    /**
     * Generates a cryptographically secure 6-digit OTP.
     * 
     * @return A 6-digit OTP string (zero-padded)
     */
    public String generateOtp() {
        return String.format("%0" + OTP_LENGTH + "d", secureRandom.nextInt(OTP_MAX_VALUE));
    }

    /**
     * Calculates the expiry time for an OTP.
     * 
     * @return Instant when the OTP will expire
     */
    public Instant getExpiryTime() {
        return Instant.now().plus(otpExpiryMinutes, ChronoUnit.MINUTES);
    }

    /**
     * Gets the configured OTP expiry duration in minutes.
     * 
     * @return Expiry duration in minutes
     */
    public int getExpiryMinutes() {
        return otpExpiryMinutes;
    }

    /**
     * Checks if an OTP has expired.
     * 
     * @param expiryTime The expiry time of the OTP
     * @return true if the OTP has expired, false otherwise
     */
    public boolean isExpired(Instant expiryTime) {
        return expiryTime == null || Instant.now().isAfter(expiryTime);
    }

    /**
     * Verifies an OTP against stored values.
     * 
     * @param storedOtp    The OTP stored in the database
     * @param storedExpiry The expiry time stored in the database
     * @param providedOtp  The OTP provided by the user
     * @throws OtpNotRequestedException if no OTP was stored
     * @throws ExpiredOtpException      if the OTP has expired
     * @throws InvalidOtpException      if the OTP doesn't match
     */
    public void verifyOtp(String storedOtp, Instant storedExpiry, String providedOtp) {
        // Check if OTP was requested
        if (storedOtp == null || storedExpiry == null) {
            throw new OtpNotRequestedException();
        }

        // Check if OTP has expired
        if (isExpired(storedExpiry)) {
            throw new ExpiredOtpException();
        }

        // Check if OTP matches
        if (!storedOtp.equals(providedOtp)) {
            throw new InvalidOtpException();
        }
    }
}
