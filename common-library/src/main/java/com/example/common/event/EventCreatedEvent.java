package com.example.common.event;

import java.io.Serializable;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class EventCreatedEvent implements Serializable {
    private Long eventId;
    private String title;
    private String organizerId;
    private LocalDateTime timestamp;
}
