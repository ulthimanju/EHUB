package com.example.common.exception;

/**
 * Exception thrown when trying to verify OTP but no OTP was requested.
 */
public class OtpNotRequestedException extends BaseApplicationException {

    private static final String ERROR_CODE = "OTP_NOT_REQUESTED";

    public OtpNotRequestedException() {
        super("No OTP has been requested", ERROR_CODE);
    }

    public OtpNotRequestedException(String email) {
        super("No OTP has been requested for: " + email, ERROR_CODE);
    }
}
