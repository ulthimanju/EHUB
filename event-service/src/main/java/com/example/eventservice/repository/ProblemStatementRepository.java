package com.example.eventservice.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.eventservice.entity.ProblemStatement;

@Repository
public interface ProblemStatementRepository extends JpaRepository<ProblemStatement, Long> {
}
