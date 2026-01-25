package com.example.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.eventservice.entity.ProblemStatement;

public interface ProblemStatementRepository extends JpaRepository<ProblemStatement, Long> {
}
