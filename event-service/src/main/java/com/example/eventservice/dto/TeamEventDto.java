package com.example.eventservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TeamEventDto {
    private String type; // e.g. INVITE, JOIN_REQUEST, MEMBER_JOINED, STATUS_UPDATE
    private String message;
    private Long teamId;
    private Object payload;
}
