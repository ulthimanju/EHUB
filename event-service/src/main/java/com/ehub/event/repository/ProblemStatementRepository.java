package com.ehub.event.repository;

import com.ehub.event.entity.ProblemStatement;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProblemStatementRepository extends JpaRepository<ProblemStatement, String> {
}
