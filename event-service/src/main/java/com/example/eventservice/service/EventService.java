package com.example.eventservice.service;

import com.example.eventservice.entity.Event;
import com.example.eventservice.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

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
            // Note: Inheritance-specific fields need checking if we want to update generic Event. 
            // Better to update specific types in a real app, but this is a start.
            return eventRepository.save(event);
        }).orElse(null);
    }

    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }
}
