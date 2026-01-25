package com.example.eventservice.entity;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Hackathon extends Event {
    private String theme;
    private Integer duration; // in hours or days? Diagram says int.
    private BigDecimal prizePool;

    @ElementCollection
    private List<String> technologies;

    @ElementCollection
    private List<String> teams;
}
