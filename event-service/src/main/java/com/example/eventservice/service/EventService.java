package com.example.eventservice.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.eventservice.entity.Event;
import com.example.eventservice.repository.EventRepository;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    public Event createEvent(Event event) {
        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> getEventById(Long id) {
        return eventRepository.findById(id);
    }

    @org.springframework.transaction.annotation.Transactional
    public Event updateEvent(Long id, Event eventDetails) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Event not found with id: " + id));
        event.updateFrom(eventDetails);
        return event;
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteEvent(Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Event not found with id: " + id));
        event.cancel();
    }

    @Autowired
    private com.example.eventservice.repository.ProblemStatementRepository problemStatementRepository;

    public com.example.eventservice.entity.ProblemStatement addProblemStatement(Long hackathonId,
            com.example.eventservice.entity.ProblemStatement problemStatement) {
        return eventRepository.findById(hackathonId)
                .map(event -> validateAndLinkProblem(event, problemStatement))
                .map(problemStatementRepository::save)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException(
                        "Event not found with id: " + hackathonId));
    }

    private com.example.eventservice.entity.ProblemStatement validateAndLinkProblem(Event event,
            com.example.eventservice.entity.ProblemStatement problemStatement) {
        if (event instanceof com.example.eventservice.entity.Hackathon) {
            com.example.eventservice.entity.Hackathon hackathon = (com.example.eventservice.entity.Hackathon) event;
            problemStatement.setHackathon(hackathon);
            return problemStatement;
        } else {
            throw new RuntimeException("Event is not a Hackathon");
        }
    }

    public List<Event> getEventsByOrganizer(String organizerUserId) {
        return eventRepository.findByOrganizerUserId(organizerUserId);
    }
}
