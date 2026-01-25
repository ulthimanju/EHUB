package com.example.common.exception;

/**
 * Exception thrown when role promotion fails.
 * Triggers transaction rollback.
 */
public class RolePromotionException extends BaseApplicationException {

    public RolePromotionException(String message) {
        super(message, "ROLE_PROMOTION_FAILED");
    }

    public RolePromotionException(String message, Throwable cause) {
        super(message, "ROLE_PROMOTION_FAILED");
        this.initCause(cause);
    }
}
