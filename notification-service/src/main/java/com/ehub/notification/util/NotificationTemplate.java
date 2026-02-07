package com.ehub.notification.util;

import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationTemplate {
    ALERT("alert-template"),
    OTP("otp-template");

    private final String value;

    NotificationTemplate(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }
}
