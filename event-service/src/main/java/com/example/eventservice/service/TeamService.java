package com.example.eventservice.service;

import java.security.Principal;
import java.util.Optional;
import java.util.Random;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.common.exception.ResourceNotFoundException;
import com.example.common.security.SecurityUtils;
import com.example.eventservice.dto.UserSummaryDto;
import com.example.eventservice.entity.Hackathon;
import com.example.eventservice.entity.Team;
import com.example.eventservice.entity.TeamMember;
import com.example.eventservice.entity.TeamMemberStatus;
import com.example.eventservice.repository.EventRepository;
import com.example.eventservice.repository.TeamMemberRepository;
import com.example.eventservice.repository.TeamRepository;

@Service
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final EventRepository eventRepository;
    private final UserClient userClient;
    private final NotificationClient notificationClient;

    public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository,
            EventRepository eventRepository, UserClient userClient, NotificationClient notificationClient) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.eventRepository = eventRepository;
        this.userClient = userClient;
        this.notificationClient = notificationClient;
    }

    @Transactional
    public Team createTeam(Long hackathonId, String teamName, Principal principal) {
        String userId = SecurityUtils.getUsername(principal)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        // Verify Hackathon Exists
        Hackathon hackathon = (Hackathon) eventRepository.findById(hackathonId)
                .filter(e -> e instanceof Hackathon)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon", "id", hackathonId));

        // Check if user is already in a team for this hackathon
        if (teamMemberRepository.findByUserIdAndHackathonId(userId, hackathonId).isPresent()) {
            throw new RuntimeException("User is already in a team for this hackathon");
        }

        // Generate unique team code
        String teamCode = generateTeamCode();

        // Create Team
        Team team = new Team();
        team.setName(teamName);
        team.setTeamCode(teamCode);
        team.setHackathon(hackathon);
        team.setLeaderUserId(userId);

        team = teamRepository.save(team);

        // Add Leader as Member (Status MEMBER)
        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUserId(userId);
        member.setStatus(TeamMemberStatus.MEMBER);
        teamMemberRepository.save(member);

        return team;
    }

    @Transactional
    public void inviteUser(Long teamId, String email, Principal principal) {
        String leaderId = SecurityUtils.getUsername(principal)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        Team team = teamRepository.findById(teamId)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "id", teamId));

        // Only leader can invite
        if (!team.getLeaderUserId().equals(leaderId)) {
            throw new RuntimeException("Only team leader can invite members");
        }

        checkTeamSize(team);

        // Validate Invitee via User Client
        UserSummaryDto invitee = userClient.getUserByEmail(email);
        if (invitee == null) {
            throw new RuntimeException("User with email " + email + " not found or not registered");
        }

        // Check if User is already in THIS team
        if (teamMemberRepository.findByTeamIdAndUserId(teamId, invitee.getUsername()).isPresent()) {
            throw new RuntimeException("User is already in this team");
        }

        // Check if User is in ANY team for this hackathon
        if (teamMemberRepository.findByUserIdAndHackathonId(invitee.getUsername(), team.getHackathon().getEventId())
                .isPresent()) {
            throw new RuntimeException("User is already in another team for this hackathon");
        }

        // Create Invitation (Status INVITED)
        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUserId(invitee.getUsername());
        member.setStatus(TeamMemberStatus.INVITED);
        teamMemberRepository.save(member);

        // Send Email
        notificationClient.sendTeamInvitation(email, team.getName(), team.getTeamCode(), leaderId);
    }

    @Transactional
    public TeamMember joinTeamByCode(String teamCode, Principal principal) {
        String userId = SecurityUtils.getUsername(principal)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        Team team = teamRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "code", teamCode));

        // Check if user is already in THIS team
        Optional<TeamMember> existingMember = teamMemberRepository.findByTeamIdAndUserId(team.getId(), userId);
        if (existingMember.isPresent()) {
            TeamMember member = existingMember.get();
            if (member.getStatus() == TeamMemberStatus.INVITED) {
                checkTeamSize(team);
                member.setStatus(TeamMemberStatus.MEMBER);
                return teamMemberRepository.save(member);
            } else if (member.getStatus() == TeamMemberStatus.MEMBER) {
                throw new RuntimeException("You are already a member of this team");
            } else if (member.getStatus() == TeamMemberStatus.REQUESTED) {
                throw new RuntimeException("You have already requested to join this team");
            }
        }

        // Check if user is in ANY team for this hackathon
        if (teamMemberRepository.findByUserIdAndHackathonId(userId, team.getHackathon().getEventId()).isPresent()) {
            throw new RuntimeException("User is already in another team for this hackathon");
        }

        checkTeamSize(team);

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUserId(userId);
        member.setStatus(TeamMemberStatus.REQUESTED);

        TeamMember savedMember = teamMemberRepository.save(member);

        // Notify Leader
        try {
            UserSummaryDto leader = userClient.getUserByUsername(team.getLeaderUserId());
            if (leader != null && leader.getEmail() != null) {
                notificationClient.sendJoinRequestNotification(leader.getEmail(), userId, team.getName());
            }
        } catch (Exception e) {
            System.err.println("Failed to send join request notification to leader: " + e.getMessage());
        }

        return savedMember;
    }

    @Transactional
    public TeamMember respondToJoinRequest(Long memberId, boolean approve, Principal principal) {
        String leaderId = SecurityUtils.getUsername(principal)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        TeamMember member = teamMemberRepository.findById(memberId)
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", "id", memberId));

        Team team = member.getTeam();
        if (!team.getLeaderUserId().equals(leaderId)) {
            throw new RuntimeException("Only team leader can manage requests");
        }

        String memberUserId = member.getUserId();

        if (approve) {
            checkTeamSize(team);
            member.setStatus(TeamMemberStatus.MEMBER);
            teamMemberRepository.save(member);
        } else {
            teamMemberRepository.delete(member); // Reject = Delete
            member = null; // Mark as null for return logic if needed, or keeping it for notification logic
                           // is tricky if deleted
        }

        // Notify Member
        try {
            UserSummaryDto user = userClient.getUserByUsername(memberUserId);
            if (user != null && user.getEmail() != null) {
                notificationClient.sendRequestStatusUpdate(user.getEmail(), team.getName(),
                        approve ? "APPROVED" : "REJECTED");
            }
        } catch (Exception e) {
            System.err.println("Failed to send status update notification: " + e.getMessage());
        }

        return member;
    }

    private void checkTeamSize(Team team) {
        if (team.getHackathon().getMaxTeamSize() != null) {
            long currentMembers = teamMemberRepository.findByTeamId(team.getId()).stream()
                    .filter(m -> m.getStatus() == TeamMemberStatus.MEMBER)
                    .count();

            if (currentMembers >= team.getHackathon().getMaxTeamSize()) {
                throw new RuntimeException("Team has reached maximum size of " + team.getHackathon().getMaxTeamSize());
            }
        }
    }

    public java.util.List<TeamMember> getTeamMembers(Long teamId) {
        return teamMemberRepository.findByTeamId(teamId);
    }

    public java.util.List<TeamMember> getMyTeams(Principal principal) {
        String userId = SecurityUtils.getUsername(principal)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));
        return teamMemberRepository.findByUserId(userId);
    }

    private String generateTeamCode() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random rnd = new Random();
        StringBuilder sb;
        String code;
        do {
            sb = new StringBuilder(6);
            for (int i = 0; i < 6; i++) {
                sb.append(chars.charAt(rnd.nextInt(chars.length())));
            }
            code = sb.toString();
        } while (teamRepository.existsByTeamCode(code));
        return code;
    }
}
