package com.example.common.exception;

/**
 * Exception thrown when an OTP verification fails due to incorrect OTP value.
 */
public class InvalidOtpException extends BaseApplicationException {

    private static final String ERROR_CODE = "OTP_INVALID";

    public InvalidOtpException() {
        super("Invalid OTP provided", ERROR_CODE);
    }

    public InvalidOtpException(String message) {
        super(message, ERROR_CODE);
    }
}
