package com.example.eventservice.entity;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonTypeInfo(
        use = JsonTypeInfo.Id.NAME,
        include = JsonTypeInfo.As.EXISTING_PROPERTY,
        property = "eventType",
        visible = true
)
@JsonSubTypes({
        @JsonSubTypes.Type(value = Conference.class, name = "CONFERENCE"),
        @JsonSubTypes.Type(value = Workshop.class, name = "WORKSHOP"),
        @JsonSubTypes.Type(value = Concert.class, name = "CONCERT"),
        @JsonSubTypes.Type(value = SportsEvent.class, name = "SPORTS"),
        @JsonSubTypes.Type(value = Hackathon.class, name = "HACKATHON")
})
public class Event {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long eventId;

    private String eventName;
    private String eventType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private String location; // Could be redundant if we have Venue, or maybe specific room/area
    
    @Column(length = 1000)
    private String description;

    @Enumerated(EnumType.STRING)
    private EventStatus status;

    private Long organizerId; // Reference to User ID

    @ManyToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "venue_id")
    private Venue venue;
}
