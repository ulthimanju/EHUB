package com.ehub.notification.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpValidationRequest {
    @NotBlank
    @Email
    private String email;
    @NotBlank
    private String otp;
}
