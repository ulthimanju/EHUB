package com.example.eventservice.entity;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class SportsEvent extends Event {
    private String sport;
    private String team1;
    private String team2;
    private String venueName; // Renamed from venue to avoid conflict with Event.venue
}
