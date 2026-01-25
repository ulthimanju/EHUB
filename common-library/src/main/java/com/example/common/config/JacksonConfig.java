package com.example.common.config;

import java.util.TimeZone;

import org.springframework.boot.autoconfigure.jackson.Jackson2ObjectMapperBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.fasterxml.jackson.databind.SerializationFeature;

/**
 * Global Jackson configuration to ensure all Date/Time fields are serialized to
 * UTC.
 */
@Configuration
public class JacksonConfig {

    @Bean
    public Jackson2ObjectMapperBuilderCustomizer jsonCustomizer() {
        return builder -> {
            // Set default timezone to UTC
            builder.timeZone(TimeZone.getTimeZone("UTC"));

            // Disable writing dates as timestamps (arrays of numbers)
            // Instead write them as ISO-8601 strings (e.g., "2023-10-05T14:30:00Z")
            builder.featuresToDisable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        };
    }
}
