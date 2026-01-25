package com.example.eventservice.entity;

public enum TeamMemberStatus {
    INVITED, // Leader invited user (User needs to accept)
    REQUESTED, // User requested to join (Leader needs to accept)
    MEMBER // Confirmed member
}
