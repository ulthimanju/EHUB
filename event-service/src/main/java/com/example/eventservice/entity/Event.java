package com.example.eventservice.entity;

import java.time.Instant;

import com.example.common.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Inheritance;
import jakarta.persistence.InheritanceType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Event entity with optimized cascade settings, database index, and Instant
 * timestamps.
 * Extends BaseEntity for audit fields.
 */
@Entity
@Table(name = "events", indexes = {
                @Index(name = "idx_event_organizer_user_id", columnList = "organizer_user_id")
})
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.EXISTING_PROPERTY, property = "eventType", visible = true)
@JsonSubTypes({
                @JsonSubTypes.Type(value = Hackathon.class, name = "HACKATHON")
})
public class Event extends BaseEntity {
        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long eventId;

        private String eventName;
        private String eventType;

        // Using Instant for UTC consistency
        private Instant startDate;
        private Instant endDate;

        private String location;

        @Column(length = 1000)
        private String description;

        @Enumerated(EnumType.STRING)
        private EventStatus status;

        private Long organizerId; // Reference to User ID (Long)

        @Column(name = "organizer_user_id")
        private String organizerUserId; // Reference to Keycloak User ID (UUID string)

        /**
         * Venue relationship with optimized cascade settings.
         * Changed from CascadeType.ALL to PERSIST and MERGE only.
         */
        @ManyToOne(cascade = { CascadeType.PERSIST, CascadeType.MERGE })
        @JoinColumn(name = "venue_id")
        private Venue venue;
}
