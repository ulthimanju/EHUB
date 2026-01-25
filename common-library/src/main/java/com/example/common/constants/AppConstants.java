package com.example.common.constants;

/**
 * Application-wide constants shared across microservices.
 */
public final class AppConstants {

    private AppConstants() {
        // Prevent instantiation
    }

    // Roles
    public static final String ROLE_USER = "USER";
    public static final String ROLE_ORGANIZER = "ORGANIZER";
    public static final String ROLE_ADMIN = "ADMIN";

    // System
    public static final String SYSTEM_USER = "SYSTEM";

    // OTP Configuration
    public static final int OTP_LENGTH = 6;
    public static final int OTP_EXPIRY_MINUTES = 2;
    public static final int OTP_MAX_VALUE = 999999;

    // API Paths
    public static final String API_V1 = "/api/v1";
    public static final String AUTH_PATH = "/auth";
    public static final String USERS_PATH = "/users";
}
