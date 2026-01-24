package com.example.common.exception;

public class BaseApplicationException extends RuntimeException {
    private final String userMessage;
    private final String errorCode;

    public BaseApplicationException(String userMessage, String errorCode) {
        super(userMessage);
        this.userMessage = userMessage;
        this.errorCode = errorCode;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
