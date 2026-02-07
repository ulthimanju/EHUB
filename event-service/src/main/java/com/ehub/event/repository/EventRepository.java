package com.ehub.event.repository;

import com.ehub.event.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EventRepository extends JpaRepository<Event, String> {
    List<Event> findByOrganizerId(String organizerId);
    Optional<Event> findByShortCode(String shortCode);
}
