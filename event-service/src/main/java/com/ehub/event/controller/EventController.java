package com.ehub.event.controller;

import com.ehub.event.dto.*;
import com.ehub.event.service.EventService;
import com.ehub.event.util.MessageKeys;
import com.ehub.event.util.RegistrationStatus;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;

    @GetMapping("/organizer/{organizerId}")
    public ResponseEntity<List<EventResponse>> getEventsByOrganizer(@PathVariable String organizerId) {
        return ResponseEntity.ok(eventService.getEventsByOrganizer(organizerId));
    }

    @GetMapping("/participant/{userId}")
    public ResponseEntity<List<EventResponse>> getEventsByParticipant(@PathVariable String userId) {
        return ResponseEntity.ok(eventService.getEventsByParticipant(userId));
    }

    @GetMapping
    public ResponseEntity<List<EventResponse>> getAllEvents() {
        return ResponseEntity.ok(eventService.getAllEvents());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EventResponse> getEventById(@PathVariable String id) {
        return ResponseEntity.ok(eventService.getEventById(id));
    }

    @GetMapping("/code/{shortCode}")
    public ResponseEntity<EventResponse> getEventByShortCode(@PathVariable String shortCode) {
        return ResponseEntity.ok(eventService.getEventByShortCode(shortCode));
    }

    @PostMapping
    public ResponseEntity<String> createEvent(@Valid @RequestBody EventRequest request) {
        String eventId = eventService.createEvent(request);
        return ResponseEntity.ok(eventId);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateEvent(
            @PathVariable String id,
            @RequestParam String requesterId,
            @Valid @RequestBody EventRequest request) {
        eventService.updateEvent(id, request, requesterId);
        return ResponseEntity.ok("Event updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteEvent(@PathVariable String id, @RequestParam String requesterId) {
        eventService.deleteEvent(id, requesterId);
        return ResponseEntity.ok("Event deleted successfully");
    }

    @PostMapping("/{eventId}/problemstatements/bulk")
    public ResponseEntity<String> addProblemStatements(
            @PathVariable String eventId,
            @RequestParam String requesterId,
            @Valid @RequestBody List<ProblemStatementRequest> requests) {
        eventService.addProblemStatements(eventId, requests, requesterId);
        return ResponseEntity.ok(MessageKeys.PROBLEM_ADDED_SUCCESS.getMessage());
    }

    @PostMapping("/{eventId}/problemstatements")
    public ResponseEntity<String> addProblemStatement(
            @PathVariable String eventId,
            @RequestParam String requesterId,
            @Valid @RequestBody ProblemStatementRequest request) {
        eventService.addProblemStatement(eventId, request, requesterId);
        return ResponseEntity.ok(MessageKeys.PROBLEM_ADDED_SUCCESS.getMessage());
    }

    @PutMapping("/problemstatements/{id}")
    public ResponseEntity<String> updateProblemStatement(
            @PathVariable String id,
            @RequestParam String requesterId,
            @Valid @RequestBody ProblemStatementRequest request) {
        eventService.updateProblemStatement(id, request, requesterId);
        return ResponseEntity.ok("Problem statement updated successfully");
    }

    @DeleteMapping("/problemstatements/{id}")
    public ResponseEntity<String> deleteProblemStatement(@PathVariable String id, @RequestParam String requesterId) {
        eventService.deleteProblemStatement(id, requesterId);
        return ResponseEntity.ok("Problem statement deleted successfully");
    }

    @PatchMapping("/{id}/finalize-results")
    public ResponseEntity<String> finalizeResults(@PathVariable String id, @RequestParam String requesterId) {
        eventService.finalizeResults(id, requesterId);
        return ResponseEntity.ok("Results finalized successfully");
    }

    @PostMapping("/{eventId}/register")
    public ResponseEntity<String> registerForEvent(
            @PathVariable String eventId,
            @Valid @RequestBody RegistrationRequest request) {
        eventService.registerForEvent(eventId, request);
        return ResponseEntity.ok(MessageKeys.REGISTRATION_SUCCESS.getMessage());
    }

    @GetMapping("/{eventId}/registrations")
    public ResponseEntity<List<RegistrationResponse>> getEventRegistrations(@PathVariable String eventId) {
        return ResponseEntity.ok(eventService.getEventRegistrations(eventId));
    }

    @DeleteMapping("/registrations/{registrationId}")
    public ResponseEntity<String> cancelRegistration(@PathVariable String registrationId) {
        eventService.cancelRegistration(registrationId);
        return ResponseEntity.ok(MessageKeys.REGISTRATION_CANCELLED.getMessage());
    }

    @PatchMapping("/registrations/{registrationId}/status")
    public ResponseEntity<String> updateRegistrationStatus(
            @PathVariable String registrationId,
            @RequestParam String requesterId,
            @RequestParam RegistrationStatus status) {
        eventService.updateRegistrationStatus(registrationId, status, requesterId);
        String message = status == RegistrationStatus.APPROVED 
            ? MessageKeys.REGISTRATION_APPROVED.getMessage() 
            : MessageKeys.REGISTRATION_REJECTED.getMessage();
        return ResponseEntity.ok(message);
    }
}
