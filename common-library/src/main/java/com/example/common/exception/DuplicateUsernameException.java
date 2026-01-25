package com.example.common.exception;

/**
 * Exception thrown when attempting to register with an existing username.
 */
public class DuplicateUsernameException extends BaseApplicationException {

    private static final String ERROR_CODE = "USERNAME_EXISTS";

    public DuplicateUsernameException() {
        super("Username already exists", ERROR_CODE);
    }

    public DuplicateUsernameException(String username) {
        super("Username '" + username + "' already exists", ERROR_CODE);
    }
}
