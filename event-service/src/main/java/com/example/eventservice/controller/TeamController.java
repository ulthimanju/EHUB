package com.example.eventservice.controller;

import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.common.dto.ApiResponse;
import com.example.eventservice.dto.CreateTeamDto;
import com.example.eventservice.dto.InviteUserDto;
import com.example.eventservice.dto.JoinTeamDto;
import com.example.eventservice.entity.Team;
import com.example.eventservice.entity.TeamMember;
import com.example.eventservice.service.TeamService;

@RestController
@RequestMapping
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping("/hackathons/{hackathonId}/teams")
    public ResponseEntity<ApiResponse<Team>> createTeam(
            @PathVariable Long hackathonId,
            @RequestBody CreateTeamDto createTeamDto,
            Principal principal) {
        Team team = teamService.createTeam(hackathonId, createTeamDto.getTeamName(), principal);
        return ResponseEntity.ok(ApiResponse.success(team));
    }

    @PostMapping("/teams/{teamId}/invite")
    public ResponseEntity<ApiResponse<Void>> inviteUser(
            @PathVariable Long teamId,
            @RequestBody InviteUserDto inviteUserDto,
            Principal principal) {
        teamService.inviteUser(teamId, inviteUserDto.getEmail(), principal);
        return ResponseEntity.ok(ApiResponse.success("User invited successfully"));
    }

    @PostMapping("/teams/join")
    public ResponseEntity<ApiResponse<TeamMember>> joinTeam(
            @RequestBody JoinTeamDto joinTeamDto,
            Principal principal) {
        TeamMember member = teamService.joinTeamByCode(joinTeamDto.getTeamCode(), principal);
        return ResponseEntity.ok(ApiResponse.success(member, "Join request processed"));
    }

    @PutMapping("/teams/members/{memberId}/approve")
    public ResponseEntity<ApiResponse<TeamMember>> approveRequest(
            @PathVariable Long memberId,
            Principal principal) {
        TeamMember member = teamService.respondToJoinRequest(memberId, true, principal);
        return ResponseEntity.ok(ApiResponse.success(member, "Request approved"));
    }

    @PutMapping("/teams/members/{memberId}/reject")
    public ResponseEntity<ApiResponse<Void>> rejectRequest(
            @PathVariable Long memberId,
            Principal principal) {
        teamService.respondToJoinRequest(memberId, false, principal);
        return ResponseEntity.ok(ApiResponse.success("Request rejected"));
    }

    @org.springframework.web.bind.annotation.GetMapping("/teams/{teamId}/members")
    public ResponseEntity<ApiResponse<java.util.List<TeamMember>>> getTeamMembers(@PathVariable Long teamId) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getTeamMembers(teamId)));
    }

    @org.springframework.web.bind.annotation.GetMapping("/teams/me")
    public ResponseEntity<ApiResponse<java.util.List<TeamMember>>> getMyTeams(Principal principal) {
        return ResponseEntity.ok(ApiResponse.success(teamService.getMyTeams(principal)));
    }
}
