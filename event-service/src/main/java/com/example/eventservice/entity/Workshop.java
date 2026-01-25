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
public class Workshop extends Event {
    private Integer maxParticipants;
    private String instructor;
    private String skillLevel;

    @ElementCollection
    private List<String> materials;
}
