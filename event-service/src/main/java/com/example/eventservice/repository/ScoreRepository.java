package com.example.eventservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.eventservice.entity.Score;

@Repository
public interface ScoreRepository extends JpaRepository<Score, Long> {
    List<Score> findBySubmissionId(Long submissionId);

    List<Score> findByJudgeId(String judgeId);
}
