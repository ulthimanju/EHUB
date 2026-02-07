package com.ehub.event.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "teams")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Team {
    @Id
    private String id;

    @Column(unique = true)
    private String shortCode;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String eventId;

    private String problemStatementId;

    private String repoUrl;
    private String demoUrl;

    private java.time.LocalDateTime submissionTime;

    private Double score;

    @Column(nullable = false)
    private String leaderId; // User ID of the leader

    @OneToMany(mappedBy = "team", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TeamMember> members = new ArrayList<>();
}
