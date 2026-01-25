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

    public Event updateEvent(Long id, Event eventDetails) {
        return eventRepository.findById(id).map(event -> {
            event.setEventName(eventDetails.getEventName());
            event.setEventType(eventDetails.getEventType());
            event.setStartDate(eventDetails.getStartDate());
            event.setEndDate(eventDetails.getEndDate());
            event.setLocation(eventDetails.getLocation());
            event.setDescription(eventDetails.getDescription());
            event.setStatus(eventDetails.getStatus());
            event.setVenue(eventDetails.getVenue());
            // Note: Inheritance-specific fields need checking if we want to update generic
            // Event.
            // Better to update specific types in a real app, but this is a start.
            return eventRepository.save(event);
        }).orElse(null);
    }

    public void deleteEvent(Long id) {
        eventRepository.findById(id).ifPresent(event -> {
            event.setStatus(com.example.eventservice.entity.EventStatus.CANCELLED);
            eventRepository.save(event);
        });
    }

    @Autowired
    private com.example.eventservice.repository.ProblemStatementRepository problemStatementRepository;

    public com.example.eventservice.entity.ProblemStatement addProblemStatement(Long hackathonId,
            com.example.eventservice.entity.ProblemStatement problemStatement) {
        return eventRepository.findById(hackathonId).map(event -> {
            if (event instanceof com.example.eventservice.entity.Hackathon) {
                com.example.eventservice.entity.Hackathon hackathon = (com.example.eventservice.entity.Hackathon) event;
                problemStatement.setHackathon(hackathon);
                return problemStatementRepository.save(problemStatement);
            } else {
                throw new RuntimeException("Event is not a Hackathon");
            }
        }).orElseThrow(() -> new RuntimeException("Event not found"));
    }

    public List<Event> getEventsByOrganizer(String organizerUserId) {
        return eventRepository.findByOrganizerUserId(organizerUserId);
    }
}
