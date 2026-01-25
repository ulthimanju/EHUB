package com.example.common.exception;

/**
 * Exception thrown when attempting to register with an existing email.
 */
public class DuplicateEmailException extends BaseApplicationException {

    private static final String ERROR_CODE = "EMAIL_EXISTS";

    public DuplicateEmailException() {
        super("Email already registered", ERROR_CODE);
    }

    public DuplicateEmailException(String email) {
        super("Email '" + email + "' is already registered", ERROR_CODE);
    }
}
