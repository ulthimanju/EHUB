package com.example.common.exception;

/**
 * Exception thrown when an OTP has expired.
 */
public class ExpiredOtpException extends BaseApplicationException {

    private static final String ERROR_CODE = "OTP_EXPIRED";

    public ExpiredOtpException() {
        super("OTP has expired", ERROR_CODE);
    }

    public ExpiredOtpException(String message) {
        super(message, ERROR_CODE);
    }
}
