package com.example.eventservice.dto;

import lombok.Data;

@Data
public class SubmissionDto {
    private String repoUrl;
    private String demoUrl;
    private String description;
    private Long problemStatementId;
}
