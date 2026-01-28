package com.example.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationRequestDto {
    private String problemTitle;
    private String problemDescription;
    private String submissionRepoUrl;
    private String submissionDemoUrl;
    private String submissionDescription;
}
