package com.ehub.event.repository;

import com.ehub.event.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface TeamRepository extends JpaRepository<Team, String> {
    List<Team> findByEventId(String eventId);
    Optional<Team> findByEventIdAndLeaderId(String eventId, String leaderId);
    Optional<Team> findByShortCode(String shortCode);
}
