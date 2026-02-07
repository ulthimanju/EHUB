package com.ehub.event.dto;

import lombok.Data;

@Data
public class TeamInviteRequest {
    private String userId;
    private String username;
    private String userEmail;
}
