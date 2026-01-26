package com.example.eventservice.service;

import java.security.Principal;
import java.util.Optional;
import java.util.Random;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.common.exception.ResourceNotFoundException;
import com.example.common.security.SecurityUtils;
import com.example.eventservice.dto.TeamEventDto;
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
    private final SimpMessagingTemplate messagingTemplate;

    public TeamService(TeamRepository teamRepository, TeamMemberRepository teamMemberRepository,
            EventRepository eventRepository, UserClient userClient, NotificationClient notificationClient,
            SimpMessagingTemplate messagingTemplate) {
        this.teamRepository = teamRepository;
        this.teamMemberRepository = teamMemberRepository;
        this.eventRepository = eventRepository;
        this.userClient = userClient;
        this.notificationClient = notificationClient;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public Team createTeam(Long hackathonId, String teamName, Principal principal) {
        String userId = SecurityUtils.getUsername(principal)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        // Verify Hackathon Exists
        Hackathon hackathon = (Hackathon) eventRepository.findById(hackathonId)
                .filter(e -> e instanceof Hackathon)
                .orElseThrow(() -> new ResourceNotFoundException("Hackathon", "id", hackathonId));

        // Check if user is already in a team
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

        // Add Leader as Member
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

        teamRepository.findById(teamId)
                .filter(team -> validateLeader(team, leaderId))
                .map(this::checkTeamSizeChain)
                .map(team -> createInvitation(team, email, leaderId))
                .map(teamMemberRepository::save)
                .ifPresentOrElse(
                        member -> sendInviteNotifications(member, email, leaderId),
                        () -> {
                            throw new ResourceNotFoundException("Team", "id", teamId);
                        });
    }

    private boolean validateLeader(Team team, String leaderId) {
        if (!team.getLeaderUserId().equals(leaderId)) {
            throw new RuntimeException("Only team leader can invite members");
        }
        return true;
    }

    private Team checkTeamSizeChain(Team team) {
        checkTeamSize(team);
        return team;
    }

    private TeamMember createInvitation(Team team, String email, String leaderId) {
        UserSummaryDto invitee = userClient.getUserByEmail(email);
        if (invitee == null) {
            throw new RuntimeException("User with email " + email + " not found or not registered");
        }

        if (teamMemberRepository.findByTeamIdAndUserId(team.getId(), invitee.getUsername()).isPresent()) {
            throw new RuntimeException("User is already in this team");
        }

        if (teamMemberRepository.findByUserIdAndHackathonId(invitee.getUsername(), team.getHackathon().getEventId())
                .isPresent()) {
            throw new RuntimeException("User is already in another team for this hackathon");
        }

        TeamMember member = new TeamMember();
        member.setTeam(team);
        member.setUserId(invitee.getUsername());
        member.setStatus(TeamMemberStatus.INVITED);
        return member;
    }

    private void sendInviteNotifications(TeamMember member, String email, String leaderId) {
        Team team = member.getTeam();
        // Send Email
        notificationClient.sendTeamInvitation(email, team.getName(), team.getTeamCode(), leaderId);
        // Real-time Notification to Invitee
        // Note: createInvitation sets userId on member from invitee.getUsername()
        sendUserUpdate(member.getUserId(), "INVITE", "You have been invited to join " + team.getName(), team);
    }

    @Transactional
    public TeamMember joinTeamByCode(String teamCode, Principal principal) {
        String userId = SecurityUtils.getUsername(principal)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        Team team = teamRepository.findByTeamCode(teamCode)
                .orElseThrow(() -> new ResourceNotFoundException("Team", "code", teamCode));

        Optional<TeamMember> existingMember = teamMemberRepository.findByTeamIdAndUserId(team.getId(), userId);
        if (existingMember.isPresent()) {
            TeamMember member = existingMember.get();
            if (member.getStatus() == TeamMemberStatus.INVITED) {
                checkTeamSize(team);
                member.setStatus(TeamMemberStatus.MEMBER);
                TeamMember saved = teamMemberRepository.save(member);

                // Broadcast update to team
                sendTeamUpdate(team.getId(), "MEMBER_JOINED", userId + " has joined the team", saved);
                return saved;
            } else if (member.getStatus() == TeamMemberStatus.MEMBER) {
                throw new RuntimeException("You are already a member of this team");
            } else if (member.getStatus() == TeamMemberStatus.REQUESTED) {
                throw new RuntimeException("You have already requested to join this team");
            }
        }

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
        String leaderId = team.getLeaderUserId();
        try {
            UserSummaryDto leader = userClient.getUserByUsername(leaderId);
            if (leader != null && leader.getEmail() != null) {
                notificationClient.sendJoinRequestNotification(leader.getEmail(), userId, team.getName());
            }
            // Real-time update to Leader
            sendUserUpdate(leaderId, "JOIN_REQUEST", userId + " requested to join " + team.getName(), savedMember);
        } catch (Exception e) {
            System.err.println("Failed to notify leader: " + e.getMessage());
        }

        return savedMember;
    }

    @Transactional
    public TeamMember respondToJoinRequest(Long memberId, boolean approve, Principal principal) {
        String leaderId = SecurityUtils.getUsername(principal)
                .orElseThrow(() -> new RuntimeException("User not authenticated"));

        return teamMemberRepository.findById(memberId)
                .map(member -> {
                    Team team = member.getTeam();
                    if (!team.getLeaderUserId().equals(leaderId)) {
                        throw new RuntimeException("Only team leader can manage requests");
                    }
                    if (approve) {
                        checkTeamSize(team);
                        member.approve();
                        // Explicit save removed, relying on @Transactional dirty checking
                        return member;
                    } else {
                        teamMemberRepository.delete(member);
                        return member;
                    }
                })
                .map(member -> {
                    if (member != null) {
                        Team team = member.getTeam();
                        String memberUserId = member.getUserId();
                        if (approve) {
                            sendTeamUpdate(team.getId(), "MEMBER_JOINED", memberUserId + " has joined the team",
                                    member);
                        }
                        notifyJoinRequestStatus(member, approve);
                    }
                    return approve ? member : null;
                })
                .orElseThrow(() -> new ResourceNotFoundException("TeamMember", "id", memberId));
    }

    private void notifyJoinRequestStatus(TeamMember member, boolean approve) {
        try {
            UserSummaryDto user = userClient.getUserByUsername(member.getUserId());
            if (user != null && user.getEmail() != null) {
                notificationClient.sendRequestStatusUpdate(user.getEmail(), member.getTeam().getName(),
                        approve ? "APPROVED" : "REJECTED");
            }
            // Real-time update to requester
            sendUserUpdate(member.getUserId(), "STATUS_UPDATE",
                    "Your request to join " + member.getTeam().getName() + " was "
                            + (approve ? "APPROVED" : "REJECTED"),
                    null);
        } catch (Exception e) {
            System.err.println("Failed to notify user: " + e.getMessage());
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

    // WebSocket Helpers
    private void sendUserUpdate(String username, String type, String message, Object payload) {
        try {
            messagingTemplate.convertAndSend("/topic/user/" + username + "/notifications",
                    new TeamEventDto(type, message, null, payload));
        } catch (Exception e) {
            System.err.println("WS Error: " + e.getMessage());
        }
    }

    private void sendTeamUpdate(Long teamId, String type, String message, Object payload) {
        try {
            messagingTemplate.convertAndSend("/topic/team/" + teamId,
                    new TeamEventDto(type, message, teamId, payload));
        } catch (Exception e) {
            System.err.println("WS Error: " + e.getMessage());
        }
    }
}
