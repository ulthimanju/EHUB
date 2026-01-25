package com.example.eventservice.entity;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.hibernate.annotations.BatchSize;

import jakarta.persistence.CascadeType;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.OneToMany;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * Hackathon entity with optimized collection handling.
 * 
 * Improvements:
 * - Changed technologies and teams from List to Set (ensures uniqueness)
 * - Added @BatchSize to reduce N+1 queries on @ElementCollection
 * - Added FetchType.LAZY to prevent loading collections unnecessarily
 */
@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Hackathon extends Event {
    private String theme;
    private Integer duration; // in hours
    private BigDecimal prizePool;

    private Integer minTeamSize;
    private Integer maxTeamSize;

    /**
     * Technologies used in this hackathon.
     * Changed to Set for uniqueness and added BatchSize to reduce N+1 queries.
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    private Set<String> technologies = new HashSet<>();

    /**
     * Teams participating in this hackathon.
     * Changed to Set for uniqueness and added BatchSize to reduce N+1 queries.
     */
    @ElementCollection(fetch = FetchType.LAZY)
    @BatchSize(size = 20)
    private Set<String> teams = new HashSet<>();

    /**
     * Problem statements for this hackathon.
     * Order matters here, so we keep it as a List.
     */
    @OneToMany(mappedBy = "hackathon", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @BatchSize(size = 10)
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<ProblemStatement> problemStatements = new ArrayList<>();
}
