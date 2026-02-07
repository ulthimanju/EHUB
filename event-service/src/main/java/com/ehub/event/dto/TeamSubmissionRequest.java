package com.ehub.event.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class TeamSubmissionRequest {
    @NotBlank(message = "Repository URL is required")
    @Pattern(regexp = "^(https?://)?[^\\s/$.?#].[^\\s]*$", message = "Invalid Repository URL format")
    private String repoUrl;

    @Pattern(regexp = "^(https?://)?[^\\s/$.?#].[^\\s]*$", message = "Invalid Demo URL format")
    private String demoUrl;
}
