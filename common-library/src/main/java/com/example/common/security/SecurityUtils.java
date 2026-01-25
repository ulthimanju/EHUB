package com.example.common.security;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

/**
 * Utility class for extracting user information from JWT authentication tokens.
 * Centralizes the repetitive JWT extraction logic used across controllers.
 */
public final class SecurityUtils {

    private SecurityUtils() {
        // Utility class - prevent instantiation
    }

    /**
     * Extracts user ID (sub claim) from JWT principal.
     * 
     * @param principal The security principal
     * @return Optional containing user ID if available
     */
    public static Optional<String> getUserId(Principal principal) {
        return getTokenAttribute(principal, "sub");
    }

    /**
     * Extracts email from JWT principal.
     * 
     * @param principal The security principal
     * @return Optional containing email if available
     */
    public static Optional<String> getEmail(Principal principal) {
        return getTokenAttribute(principal, "email");
    }

    /**
     * Extracts preferred username from JWT principal.
     * Falls back to principal name if preferred_username is not available.
     * 
     * @param principal The security principal
     * @return Optional containing username if available
     */
    public static Optional<String> getUsername(Principal principal) {
        if (principal == null) {
            return Optional.empty();
        }

        Optional<String> preferredUsername = getTokenAttribute(principal, "preferred_username");
        if (preferredUsername.isPresent()) {
            return preferredUsername;
        }

        return Optional.ofNullable(principal.getName());
    }

    /**
     * Extracts first name (given_name) from JWT principal.
     * 
     * @param principal The security principal
     * @return Optional containing first name if available
     */
    public static Optional<String> getFirstName(Principal principal) {
        return getTokenAttribute(principal, "given_name");
    }

    /**
     * Extracts last name (family_name) from JWT principal.
     * 
     * @param principal The security principal
     * @return Optional containing last name if available
     */
    public static Optional<String> getLastName(Principal principal) {
        return getTokenAttribute(principal, "family_name");
    }

    /**
     * Extracts a specific attribute from the JWT token.
     * 
     * @param principal     The security principal
     * @param attributeName The name of the attribute to extract
     * @return Optional containing attribute value if available
     */
    public static Optional<String> getTokenAttribute(Principal principal, String attributeName) {
        if (principal instanceof JwtAuthenticationToken jwtToken) {
            Map<String, Object> attributes = jwtToken.getTokenAttributes();
            Object value = attributes.get(attributeName);
            if (value != null) {
                return Optional.of(value.toString());
            }
        }
        return Optional.empty();
    }

    /**
     * Gets all token attributes from the JWT.
     * 
     * @param principal The security principal
     * @return Optional containing attributes map if available
     */
    public static Optional<Map<String, Object>> getTokenAttributes(Principal principal) {
        if (principal instanceof JwtAuthenticationToken jwtToken) {
            return Optional.of(jwtToken.getTokenAttributes());
        }
        return Optional.empty();
    }

    /**
     * Checks if the principal is a valid JWT authentication token.
     * 
     * @param principal The security principal
     * @return true if principal is a JwtAuthenticationToken
     */
    public static boolean isJwtAuthenticated(Principal principal) {
        return principal instanceof JwtAuthenticationToken;
    }

    /**
     * Extracts user info into a convenient record.
     * 
     * @param principal The security principal
     * @return UserInfo record with extracted values
     */
    public static UserInfo extractUserInfo(Principal principal) {
        return new UserInfo(
                getUsername(principal).orElse(null),
                getEmail(principal).orElse(null),
                getFirstName(principal).orElse(null),
                getLastName(principal).orElse(null),
                getUserId(principal).orElse(null));
    }

    /**
     * Record containing extracted user information from JWT.
     */
    public record UserInfo(
            String username,
            String email,
            String firstName,
            String lastName,
            String userId) {
        public boolean isComplete() {
            return username != null && email != null;
        }
    }
}
