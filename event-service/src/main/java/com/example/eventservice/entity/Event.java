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
        @com.example.common.id.SnowflakeId
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
        private EventStatus eventStatus;

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

        /**
         * Updates the fields of this event from another event object.
         * Encapsulates the update logic within the entity.
         */
        public void updateFrom(Event other) {
                this.eventName = other.getEventName();
                this.eventType = other.getEventType();
                this.startDate = other.getStartDate();
                this.endDate = other.getEndDate();
                this.location = other.getLocation();
                this.description = other.getDescription();
                this.eventStatus = other.getEventStatus();
                this.venue = other.getVenue();
        }

        public void cancel() {
                this.eventStatus = EventStatus.CANCELLED;
        }
}
