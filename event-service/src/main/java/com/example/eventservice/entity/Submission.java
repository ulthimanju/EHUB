package com.example.eventservice.entity;

import com.example.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "submissions")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Submission extends BaseEntity {

    @Id
    @com.example.common.id.SnowflakeId
    private Long id;

    @Column(nullable = false)
    private String repoUrl;

    private String demoUrl;

    @Column(length = 2000)
    private String description;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false, unique = true)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "problem_statement_id")
    private ProblemStatement problemStatement;

    public void updateFrom(com.example.eventservice.dto.SubmissionDto dto, ProblemStatement problemStatement) {
        this.repoUrl = dto.getRepoUrl();
        this.demoUrl = dto.getDemoUrl();
        this.description = dto.getDescription();
        this.problemStatement = problemStatement;
    }
}
