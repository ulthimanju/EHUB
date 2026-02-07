package com.ehub.event.service;

import com.ehub.event.dto.*;
import com.ehub.event.entity.*;
import com.ehub.event.repository.*;
import com.ehub.event.util.TeamMemberStatus;
import com.ehub.event.util.TeamRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final EventRepository eventRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ProblemStatementRepository problemStatementRepository;

    @Transactional
    public void createTeam(String eventId, TeamCreateRequest request) {
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Event not found");
        }

        Team team = Team.builder()
                .id(UUID.randomUUID().toString())
                .name(request.getName())
                .eventId(eventId)
                .leaderId(request.getUserId())
                .shortCode(generateShortCode())
                .score(0.0)
                .build();

        Team savedTeam = teamRepository.save(team);

        TeamMember leader = TeamMember.builder()
                .id(UUID.randomUUID().toString())
                .team(savedTeam)
                .userId(request.getUserId())
                .username(request.getUsername())
                .userEmail(request.getUserEmail())
                .role(TeamRole.LEADER)
                .status(TeamMemberStatus.ACCEPTED)
                .build();

        teamMemberRepository.save(leader);
    }

    public List<TeamResponse> getTeamsByEvent(String eventId) {
        List<Team> teams = teamRepository.findByEventId(eventId);
        return teams.stream().map(this::mapToTeamResponse).toList();
    }

    public TeamResponse getTeamByShortCode(String shortCode) {
        Team team = teamRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        return mapToTeamResponse(team);
    }

    @Transactional
    public void inviteMember(String teamId, TeamInviteRequest request) {
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, request.getUserId())) {
            throw new RuntimeException("User is already a member or has a pending association with this team");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        TeamMember member = TeamMember.builder()
                .id(UUID.randomUUID().toString())
                .team(team)
                .userId(request.getUserId())
                .username(request.getUsername())
                .userEmail(request.getUserEmail())
                .role(TeamRole.MEMBER)
                .status(TeamMemberStatus.INVITED)
                .build();

        teamMemberRepository.save(member);
    }

    @Transactional
    public void requestToJoin(String teamId, TeamInviteRequest request) {
        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, request.getUserId())) {
            throw new RuntimeException("You have already requested to join or are already a member of this team");
        }

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        TeamMember member = TeamMember.builder()
                .id(UUID.randomUUID().toString())
                .team(team)
                .userId(request.getUserId())
                .username(request.getUsername())
                .userEmail(request.getUserEmail())
                .role(TeamRole.MEMBER)
                .status(TeamMemberStatus.REQUESTED)
                .build();

        teamMemberRepository.save(member);
    }

    @Transactional
    public void respondToInvite(String teamId, String userId, boolean accept) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));

        if (accept) {
            member.setStatus(TeamMemberStatus.ACCEPTED);
            teamMemberRepository.save(member);
        } else {
            teamMemberRepository.delete(member);
        }
    }

    @Transactional
    public void dismantleTeam(String teamId, String leaderId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getLeaderId().equals(leaderId)) {
            throw new RuntimeException("Only leader can dismantle team");
        }

        teamRepository.delete(team);
    }

    @Transactional
    public void transferLeadership(String teamId, String currentLeaderId, String newLeaderId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getLeaderId().equals(currentLeaderId)) {
            throw new RuntimeException("Only leader can transfer leadership");
        }

        TeamMember currentLeader = teamMemberRepository.findByTeamIdAndUserId(teamId, currentLeaderId)
                .orElseThrow(() -> new RuntimeException("Leader not found"));
        TeamMember nextLeader = teamMemberRepository.findByTeamIdAndUserId(teamId, newLeaderId)
                .orElseThrow(() -> new RuntimeException("Member not found"));

        currentLeader.setRole(TeamRole.MEMBER);
        nextLeader.setRole(TeamRole.LEADER);
        team.setLeaderId(newLeaderId);

        teamMemberRepository.save(currentLeader);
        teamMemberRepository.save(nextLeader);
        teamRepository.save(team);
    }

    @Transactional
    public void leaveTeam(String teamId, String userId) {
        TeamMember member = teamMemberRepository.findByTeamIdAndUserId(teamId, userId)
                .orElseThrow(() -> new RuntimeException("Membership not found"));

        if (member.getRole() == TeamRole.LEADER) {
            throw new RuntimeException("Leader cannot leave. Dismantle or transfer leadership first.");
        }

        teamMemberRepository.delete(member);
    }

    @Transactional
    public void updateProblemStatement(String teamId, String leaderId, String problemId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getLeaderId().equals(leaderId)) {
            throw new RuntimeException("Only team leader can select problem statement");
        }

        team.setProblemStatementId(problemId);
        teamRepository.save(team);
    }

    @Transactional
    public void submitProject(String teamId, String userId, TeamSubmissionRequest request) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));

        if (!team.getLeaderId().equals(userId)) {
            throw new RuntimeException("Only team leader can submit project");
        }

        team.setRepoUrl(request.getRepoUrl());
        team.setSubmissionTime(java.time.LocalDateTime.now());
        teamRepository.save(team);
    }

    public Map<String, Object> getTeamForEvaluation(String teamId) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        
        Map<String, Object> map = new HashMap<>();
        map.put("teamId", team.getId());
        map.put("teamName", team.getName());
        map.put("repoUrl", team.getRepoUrl());
        
        if (team.getProblemStatementId() != null) {
            problemStatementRepository.findById(team.getProblemStatementId())
                    .ifPresent(ps -> map.put("problemStatement", ps.getStatement()));
        }
        
        return map;
    }

    public List<Map<String, Object>> getEventEvaluationContext(String eventId) {
        List<Team> teams = teamRepository.findByEventId(eventId);
        return teams.stream()
                .filter(t -> t.getRepoUrl() != null && !t.getRepoUrl().isBlank())
                .map(t -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("teamId", t.getId());
                    map.put("teamName", t.getName());
                    map.put("repoUrl", t.getRepoUrl());
                    
                    if (t.getProblemStatementId() != null) {
                        problemStatementRepository.findById(t.getProblemStatementId())
                                .ifPresent(ps -> map.put("problemStatement", ps.getStatement()));
                    }
                    
                    return map;
                })
                .toList();
    }

    @Transactional
    public void updateScore(String teamId, Double score) {
        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new RuntimeException("Team not found"));
        team.setScore(score);
        teamRepository.save(team);
    }

    private String generateShortCode() {
        return UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private TeamResponse mapToTeamResponse(Team team) {
        List<TeamResponse.TeamMemberResponse> memberDtos = teamMemberRepository.findByTeamId(team.getId())
                .stream()
                .map(m -> TeamResponse.TeamMemberResponse.builder()
                        .id(m.getId())
                        .userId(m.getUserId())
                        .username(m.getUsername())
                        .userEmail(m.getUserEmail())
                        .role(m.getRole().name())
                        .status(m.getStatus().name())
                        .build())
                .toList();

        return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .shortCode(team.getShortCode())
                .eventId(team.getEventId())
                .problemStatementId(team.getProblemStatementId())
                .repoUrl(team.getRepoUrl())
                .demoUrl(team.getDemoUrl())
                .submissionTime(team.getSubmissionTime())
                .leaderId(team.getLeaderId())
                .score(team.getScore())
                .members(memberDtos)
                .build();
    }
}
