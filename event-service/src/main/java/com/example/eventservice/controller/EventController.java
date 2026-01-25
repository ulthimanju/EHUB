package com.example.eventservice.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.eventservice.entity.Event;
import com.example.eventservice.service.EventService;

@RestController
@RequestMapping("/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody Event event) {
        try {
            return ResponseEntity.ok(eventService.createEvent(event));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error creating event: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<?> getAllEvents() {
        try {
            return ResponseEntity.ok(eventService.getAllEvents());
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Error fetching events: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody Event event) {
        Event updatedEvent = eventService.updateEvent(id, event);
        if (updatedEvent != null) {
            return ResponseEntity.ok(updatedEvent);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }
}
