package com.ehub.event.util;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MessageKeys {
    EVENT_NOT_FOUND("Event not found"),
    UNAUTHORIZED_ORGANIZER("Only the event organizer can perform this action"),
    EVENT_CREATED_SUCCESS("Event created successfully"),
    PROBLEM_ADDED_SUCCESS("Problem statement added successfully"),
    REGISTRATION_SUCCESS("Successfully registered for the event"),
    ALREADY_REGISTERED("You are already registered for this event"),
    REGISTRATION_NOT_FOUND("Registration record not found"),
    REGISTRATION_CANCELLED("Registration cancelled successfully"),
    REGISTRATION_APPROVED("Participant approved successfully"),
    REGISTRATION_REJECTED("Participant rejected successfully"),
    
    TEAM_CREATED("Team created successfully"),
    TEAM_DISMANTLED("Team dismantled successfully"),
    TEAM_LEAVE_SUCCESS("Left the team successfully"),
    TEAM_INVITE_SENT("Invitation sent successfully"),
    TEAM_JOIN_REQUEST_SENT("Join request sent successfully"),
    TEAM_STATUS_UPDATED("Team status updated successfully"),
    TEAM_LEADERSHIP_TRANSFERRED("Leadership transferred successfully"),
    
    TEAM_NOT_FOUND("Team not found"),
    TEAM_MEMBER_NOT_FOUND("Team member not found"),
    ALREADY_IN_TEAM("User is already part of a team in this event"),
    NOT_TEAM_LEADER("Only the team leader can perform this action");

    private final String message;
}