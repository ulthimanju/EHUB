package com.example.eventservice.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.eventservice.entity.Team;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByTeamCode(String teamCode);

    boolean existsByTeamCode(String teamCode);

    boolean existsByHackathonIdAndLeaderUserId(Long hackathonId, String leaderUserId);
}
