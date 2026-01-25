package com.example.common.exception;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import com.example.common.dto.ErrorResponse;

/**
 * Global exception handler for consistent error responses across all
 * microservices.
 * Handles custom exceptions with appropriate HTTP status codes.
 */
@ControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // ==================== 404 NOT FOUND ====================

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFound(
            ResourceNotFoundException ex, WebRequest request) {

        log.warn("Resource not found: {}", ex.getUserMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error("Resource Not Found")
                .message(ex.getUserMessage())
                .path(extractPath(request))
                .build();

        return new ResponseEntity<>(error, HttpStatus.NOT_FOUND);
    }

    // ==================== 400 BAD REQUEST (Validation/OTP Errors)
    // ====================

    /**
     * Handles OTP-related exceptions with 400 Bad Request.
     */
    @ExceptionHandler({
            InvalidOtpException.class,
            ExpiredOtpException.class,
            OtpNotRequestedException.class
    })
    public ResponseEntity<ErrorResponse> handleOtpExceptions(
            BaseApplicationException ex, WebRequest request) {

        log.warn("OTP validation failed: {} - {}", ex.getErrorCode(), ex.getUserMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(ex.getErrorCode())
                .message(ex.getUserMessage())
                .path(extractPath(request))
                .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // ==================== 409 CONFLICT (Duplicate Resources) ====================

    /**
     * Handles duplicate resource exceptions with 409 Conflict.
     */
    @ExceptionHandler({
            DuplicateUsernameException.class,
            DuplicateEmailException.class
    })
    public ResponseEntity<ErrorResponse> handleDuplicateExceptions(
            BaseApplicationException ex, WebRequest request) {

        log.warn("Duplicate resource: {} - {}", ex.getErrorCode(), ex.getUserMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error(ex.getErrorCode())
                .message(ex.getUserMessage())
                .path(extractPath(request))
                .build();

        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    // ==================== 400 BAD REQUEST (Generic Application Exceptions)
    // ====================

    /**
     * Handles all other BaseApplicationExceptions with 400 Bad Request.
     */
    @ExceptionHandler(BaseApplicationException.class)
    public ResponseEntity<ErrorResponse> handleBaseApplicationException(
            BaseApplicationException ex, WebRequest request) {

        log.warn("Application exception: {} - {}", ex.getErrorCode(), ex.getUserMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(ex.getErrorCode())
                .message(ex.getUserMessage())
                .path(extractPath(request))
                .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // ==================== 400 BAD REQUEST (IllegalArgumentException)
    // ====================

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(
            IllegalArgumentException ex, WebRequest request) {

        log.warn("Invalid argument: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error("INVALID_ARGUMENT")
                .message(ex.getMessage())
                .path(extractPath(request))
                .build();

        return new ResponseEntity<>(error, HttpStatus.BAD_REQUEST);
    }

    // ==================== 500 INTERNAL SERVER ERROR ====================

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobalException(
            Exception ex, WebRequest request) {

        log.error("Unexpected error occurred", ex);

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error("Internal Server Error")
                .message("An unexpected error occurred. Please try again later.")
                .path(extractPath(request))
                .build();

        return new ResponseEntity<>(error, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ==================== HELPER METHODS ====================

    private String extractPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }
}
