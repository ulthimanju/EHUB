package com.example.eventservice.entity;

import java.math.BigDecimal;
import java.time.Instant;

import com.example.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Registration entity with optimized fetch type, database indexes, and Instant
 * timestamp.
 * Extends BaseEntity for audit fields.
 */
@Entity
@Table(name = "registrations", indexes = {
        @Index(name = "idx_registration_attendee", columnList = "attendeeId"),
        @Index(name = "idx_registration_event", columnList = "event_id")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Registration extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long registrationId;

    private Instant registrationDate;

    @Enumerated(EnumType.STRING)
    private RegistrationStatus status;

    private BigDecimal amount;

    @Column(name = "attendeeId")
    private Long attendeeId; // User ID

    /**
     * Event relationship with LAZY fetch type.
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private Event event;
}
