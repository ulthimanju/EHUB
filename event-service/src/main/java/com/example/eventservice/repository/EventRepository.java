package com.example.eventservice.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.eventservice.entity.Event;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "venue")
    List<Event> findAll();

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = "venue")
    List<Event> findByOrganizerUserId(String organizerUserId);
}
