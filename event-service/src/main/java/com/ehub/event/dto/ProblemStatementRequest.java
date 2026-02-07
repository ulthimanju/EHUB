package com.ehub.event.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ProblemStatementRequest {
    private String statementId;
    
    @NotBlank(message = "Statement content is required")
    private String statement;
}
