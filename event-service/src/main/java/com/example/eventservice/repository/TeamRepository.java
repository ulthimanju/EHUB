package com.example.eventservice.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.eventservice.entity.Team;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    Optional<Team> findByTeamCode(String teamCode);

    boolean existsByTeamCode(String teamCode);

    // Look up by Hackathon (using EventId property from inherited Event class)
    boolean existsByHackathonEventIdAndLeaderUserId(Long hackathonId, String leaderUserId);

    List<Team> findByHackathonEventId(Long hackathonId);
}
