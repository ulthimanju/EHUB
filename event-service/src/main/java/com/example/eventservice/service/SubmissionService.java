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
    private final AiClient aiClient;
    private final com.example.eventservice.repository.ScoreRepository scoreRepository;

    public SubmissionService(SubmissionRepository submissionRepository, TeamRepository teamRepository,
            ProblemStatementRepository problemStatementRepository, AiClient aiClient,
            com.example.eventservice.repository.ScoreRepository scoreRepository) {
        this.submissionRepository = submissionRepository;
        this.teamRepository = teamRepository;
        this.problemStatementRepository = problemStatementRepository;
        this.aiClient = aiClient;
        this.scoreRepository = scoreRepository;
    }

    @Transactional
    public com.example.eventservice.entity.Score evaluateSubmission(Long submissionId) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission", "id", submissionId));

        if (submission.getProblemStatement() == null) {
            throw new RuntimeException("Submission does not have a problem statement");
        }

        // Map to DTO
        com.example.common.dto.EvaluationRequestDto request = new com.example.common.dto.EvaluationRequestDto(
                submission.getProblemStatement().getTitle(),
                submission.getProblemStatement().getDescription(),
                submission.getRepoUrl(),
                submission.getDemoUrl(),
                submission.getDescription());

        // Call AI Service
        com.example.common.dto.EvaluationResponseDto response = aiClient.evaluate(request);

        // Map back to Entity
        com.example.eventservice.entity.Score score = new com.example.eventservice.entity.Score();
        score.setScore(response.getScore());
        score.setFeedback(response.getFeedback());
        score.setJudgeId(response.getJudgeId());
        score.setSubmission(submission);

        return scoreRepository.save(score);
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

        // VALIDATION: Check Submission Window (Must be before Hackathon Ends)
        if (team.getHackathon() instanceof com.example.eventservice.entity.Hackathon) {
            com.example.eventservice.entity.Hackathon hackathon = (com.example.eventservice.entity.Hackathon) team
                    .getHackathon();
            if (hackathon.getEndDate() != null && java.time.Instant.now().isAfter(hackathon.getEndDate())) {
                throw new RuntimeException("Submission deadline has passed. Event ended at: " + hackathon.getEndDate());
            }
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
