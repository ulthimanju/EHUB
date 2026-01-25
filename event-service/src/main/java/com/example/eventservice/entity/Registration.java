package com.example.eventservice.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Registration {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long registrationId;

    private LocalDateTime registrationDate;

    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    private BigDecimal amount;

    private Long attendeeId; // User ID

    @ManyToOne
    @JoinColumn(name = "event_id")
    private Event event;
}
