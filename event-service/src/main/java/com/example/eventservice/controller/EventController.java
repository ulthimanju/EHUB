package com.example.eventservice.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.common.dto.ApiResponse;
import com.example.common.security.SecurityUtils;
import com.example.eventservice.entity.Event;
import com.example.eventservice.entity.ProblemStatement;
import com.example.eventservice.service.EventService;

@RestController
@RequestMapping("/events")
public class EventController {

    private final EventService eventService;
    private final SimpMessagingTemplate messagingTemplate;

    public EventController(EventService eventService, SimpMessagingTemplate messagingTemplate) {
        this.eventService = eventService;
        this.messagingTemplate = messagingTemplate;
    }

    // ==================== HELPER METHODS ====================

    /**
     * Extracts the current user ID from the principal using SecurityUtils.
     */
    private String getCurrentUserId(Principal principal) {
        return SecurityUtils.getUserId(principal)
                .orElse(principal != null ? principal.getName() : null);
    }

    /**
     * Checks if the current user is the owner of the event.
     * Returns true if the event has no owner or if the user is the owner.
     */
    private boolean isOwner(Event event, Principal principal) {
        if (event.getOrganizerUserId() == null) {
            return true; // No owner set, allow access
        }
        String userId = getCurrentUserId(principal);
        return event.getOrganizerUserId().equals(userId);
    }

    // ==================== CRUD OPERATIONS ====================

    @PostMapping
    public ResponseEntity<ApiResponse<Event>> createEvent(@RequestBody Event event, Principal principal) {
        String userId = getCurrentUserId(principal);
        if (userId != null) {
            event.setOrganizerUserId(userId);
        }
        return ResponseEntity.ok(ApiResponse.success(eventService.createEvent(event), "Event created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Event>>> getAllEvents() {
        return ResponseEntity.ok(ApiResponse.success(eventService.getAllEvents()));
    }

    @GetMapping("/my-events")
    public ResponseEntity<ApiResponse<List<Event>>> getMyEvents(Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("UNAUTHORIZED", "User not authenticated"));
        }
        String userId = getCurrentUserId(principal);
        return ResponseEntity.ok(ApiResponse.success(eventService.getEventsByOrganizer(userId)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Event>> getEventById(@PathVariable Long id) {
        return eventService.getEventById(id)
                .map(event -> ResponseEntity.ok(ApiResponse.success(event)))
                .orElse(ResponseEntity.status(404).body(ApiResponse.error("NOT_FOUND", "Event not found")));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Event>> updateEvent(@PathVariable Long id, @RequestBody Event event,
            Principal principal) {
        return eventService.getEventById(id).map(existingEvent -> {
            // Check ownership using helper method
            if (!isOwner(existingEvent, principal)) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.<Event>error("FORBIDDEN", "You are not the owner of this event"));
            }

            // Preserve the organizerUserId if not passed
            if (event.getOrganizerUserId() == null) {
                event.setOrganizerUserId(existingEvent.getOrganizerUserId());
            }

            try {
                Event updatedEvent = eventService.updateEvent(id, event);
                return ResponseEntity.ok(ApiResponse.success(updatedEvent, "Event updated successfully"));
            } catch (jakarta.persistence.EntityNotFoundException e) {
                return ResponseEntity.status(404).body(ApiResponse.error("NOT_FOUND", "Event not found"));
            }
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("NOT_FOUND", "Event not found")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteEvent(@PathVariable Long id, Principal principal) {
        return eventService.getEventById(id).map(existingEvent -> {
            // Check ownership using helper method
            if (!isOwner(existingEvent, principal)) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.<Void>error("FORBIDDEN", "You are not the owner of this event"));
            }

            eventService.deleteEvent(id);
            return ResponseEntity.ok(ApiResponse.<Void>success("Event deleted successfully"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("NOT_FOUND", "Event not found")));
    }

    // ==================== PROBLEM STATEMENTS ====================

    @PostMapping("/{id}/problem-statements")
    public ResponseEntity<ApiResponse<ProblemStatement>> addProblemStatement(
            @PathVariable Long id,
            @RequestBody ProblemStatement problemStatement,
            Principal principal) {

        return eventService.getEventById(id).map(existingEvent -> {
            // Check ownership using helper method
            if (!isOwner(existingEvent, principal)) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.<ProblemStatement>error("FORBIDDEN", "You are not the owner of this event"));
            }

            ProblemStatement savedProblem = eventService.addProblemStatement(id, problemStatement);

            // Broadcast update via WebSocket
            messagingTemplate.convertAndSend("/topic/events/" + id + "/problem-statements", savedProblem);

            return ResponseEntity.ok(ApiResponse.success(savedProblem, "Problem statement added successfully"));
        }).orElse(ResponseEntity.status(404).body(ApiResponse.error("NOT_FOUND", "Event not found")));
    }
}
