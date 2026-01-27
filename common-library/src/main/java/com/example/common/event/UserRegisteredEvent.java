package com.example.common.event;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UserRegisteredEvent implements Serializable {
    private String userId;
    private String email;
    private String username;
    private LocalDateTime timestamp;
}
