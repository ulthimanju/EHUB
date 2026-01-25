package com.example.eventservice.entity;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Conference extends Event {
    private String theme;
    private Integer numberOfTracks;

    @ElementCollection
    private List<String> speakers;
}
