package com.ehub.gateway.util;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MessageKeys {
    MISSING_AUTH_HEADER("Missing authorization header"),
    UNAUTHORIZED_ACCESS("Unauthorized access to application");

    private final String message;
}
