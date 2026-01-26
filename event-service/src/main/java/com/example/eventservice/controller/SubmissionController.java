package com.example.eventservice.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.common.dto.ApiResponse;
import com.example.eventservice.dto.SubmissionDto;
import com.example.eventservice.entity.Submission;
import com.example.eventservice.service.SubmissionService;

@RestController
public class SubmissionController {

    private final SubmissionService submissionService;

    public SubmissionController(SubmissionService submissionService) {
        this.submissionService = submissionService;
    }

    @PostMapping("/teams/{teamId}/submission")
    public ResponseEntity<ApiResponse<Submission>> submitProject(
            @PathVariable Long teamId,
            @RequestBody SubmissionDto submissionDto,
            Principal principal) {
        Submission submission = submissionService.submitProject(teamId, submissionDto, principal);
        return ResponseEntity.ok(ApiResponse.success(submission, "Project submitted successfully"));
    }

    @GetMapping("/teams/{teamId}/submission")
    public ResponseEntity<ApiResponse<Submission>> getSubmission(@PathVariable Long teamId) {
        return ResponseEntity.ok(ApiResponse.success(submissionService.getSubmission(teamId)));
    }

    @PostMapping("/submissions/{id}/evaluate")
    public ResponseEntity<ApiResponse<com.example.eventservice.entity.Score>> evaluateSubmission(
            @PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(submissionService.evaluateSubmission(id)));
    }
}
