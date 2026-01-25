package com.example.common.util;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

/**
 * Utility class for date and time operations, enforcing UTC consistency.
 */
public final class DateUtils {

    public static final String ISO_DATE_TIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern(ISO_DATE_TIME_FORMAT)
            .withZone(ZoneId.of("UTC"));

    private DateUtils() {
        // Prevent instantiation
    }

    /**
     * Gets the current time in UTC as Instant.
     * This is the preferred way to get "now".
     */
    public static Instant now() {
        return Instant.now();
    }

    /**
     * Formats an Instant to ISO string in UTC.
     */
    public static String format(Instant instant) {
        if (instant == null)
            return null;
        return FORMATTER.format(instant);
    }

    /**
     * Converts LocalDateTime (assumed system default) to UTC Instant.
     * Use this when migrating legacy code.
     */
    public static Instant toInstant(LocalDateTime localDateTime) {
        if (localDateTime == null)
            return null;
        return localDateTime.atZone(ZoneId.systemDefault()).toInstant();
    }
}
