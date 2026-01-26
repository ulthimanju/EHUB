package com.example.eventservice.service;

import java.security.Principal;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.common.exception.ResourceNotFoundException;
import com.example.common.security.SecurityUtils;
import com.example.eventservice.dto.SubmissionDto;
import com.example.eventservice.entity.ProblemStatement;
import com.example.eventservice.entity.Submission;
import com.example.eventservice.entity.Team;
import com.example.eventservice.repository.ProblemStatementRepository;
import com.example.eventservice.repository.SubmissionRepository;
import com.example.eventservice.repository.TeamRepository;

@Service
public class SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;
    private final ProblemStatementRepository problemStatementRepository;

    public SubmissionService(SubmissionRepository submissionRepository, TeamRepository teamRepository,
            ProblemStatementRepository problemStatementRepository) {
        this.submissionRepository = submissionRepository;
        this.teamRepository = teamRepository;
        this.problemStatementRepository = problemStatementRepository;
    }

    @Transactional
    public Submission submitProject(Long teamId, SubmissionDto dto, Principal principal) {
        String userId = SecurityUtils.getUsername(principal)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));

        if (!team.getLeaderUserId().equals(userId)) {
            throw new RuntimeException("Only team leader can submit the project");
        }

        if (!isValidUrl(dto.getRepoUrl())) {
            throw new RuntimeException("Invalid Repository URL");
        }

        Submission submission = submissionRepository.findByTeamId(teamId)
                .orElseGet(() -> {
                    Submission newSub = new Submission();
                    newSub.setTeam(team);
                    return newSub;
                });

        ProblemStatement ps = null;
        if (dto.getProblemStatementId() != null) {
            ps = problemStatementRepository.findById(dto.getProblemStatementId())
                    .orElseThrow(
                            () -> new ResourceNotFoundException("ProblemStatement", "id", dto.getProblemStatementId()));
        }

        submission.updateFrom(dto, ps);
        return submissionRepository.save(submission);
    }

    public Submission getSubmission(Long teamId) {
        return submissionRepository.findByTeamId(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "teamId", teamId));
    }

    // Simple validation helper
    private boolean isValidUrl(String url) {
        return url != null && (url.startsWith("http://") || url.startsWith("https://"));
    }
}
