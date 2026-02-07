package com.ehub.event.service;

import com.ehub.event.dto.*;
import com.ehub.event.entity.Event;
import com.ehub.event.entity.ProblemStatement;
import com.ehub.event.entity.Registration;
import com.ehub.event.repository.EventRepository;
import com.ehub.event.repository.ProblemStatementRepository;
import com.ehub.event.repository.RegistrationRepository;
import com.ehub.event.util.MessageKeys;
import com.ehub.event.util.RegistrationStatus;
import com.ehub.event.util.ShortCodeGenerator;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EventService {

    private final EventRepository eventRepository;
    private final ProblemStatementRepository problemRepository;
    private final RegistrationRepository registrationRepository;
    private final RestTemplate restTemplate;

    @Value("${APPLICATION_COMMON_SERVICE_URL}")
    private String commonServiceUrl;

    @Value("${application.notification-service.url}")
    private String notificationServiceUrl;

    public List<EventResponse> getEventsByOrganizer(String organizerId) {
        return eventRepository.findByOrganizerId(organizerId).stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getEventsByParticipant(String userId) {
        List<String> eventIds = registrationRepository.findByUserId(userId).stream()
                .map(Registration::getEventId)
                .collect(Collectors.toList());
        
        return eventRepository.findAllById(eventIds).stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::mapToEventResponse)
                .collect(Collectors.toList());
    }

    public EventResponse getEventById(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        return mapToEventResponse(event);
    }

    public EventResponse getEventByShortCode(String shortCode) {
        Event event = eventRepository.findByShortCode(shortCode)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        return mapToEventResponse(event);
    }

    private EventResponse mapToEventResponse(Event event) {
        return EventResponse.builder()
                .id(event.getId())
                .shortCode(event.getShortCode())
                .name(event.getName())
                .description(event.getDescription())
                .theme(event.getTheme())
                .contactEmail(event.getContactEmail())
                .prizes(event.getPrizes())
                .rules(event.getRules())
                .startDate(event.getStartDate())
                .endDate(event.getEndDate())
                .registrationStartDate(event.getRegistrationStartDate())
                .registrationEndDate(event.getRegistrationEndDate())
                .judging(Boolean.TRUE.equals(event.getJudging()))
                .resultsDate(event.getResultsDate())
                .venue(event.getVenue())
                .isVirtual(event.isVirtual())
                .location(event.getLocation())
                .maxParticipants(event.getMaxParticipants())
                .teamSize(event.getTeamSize())
                .status(event.getStatus())
                .organizerId(event.getOrganizerId())
                .problemStatements(event.getProblemStatements().stream()
                        .map(ps -> EventResponse.ProblemStatementResponse.builder()
                                .id(ps.getId())
                                .statementId(ps.getStatementId())
                                .statement(ps.getStatement())
                                .build())
                        .collect(Collectors.toList()))
                .build();
    }

    public String createEvent(EventRequest request) {
        String id = restTemplate.getForObject(commonServiceUrl + "/uuid", String.class);
        String shortCode = ShortCodeGenerator.generate(8);
        
        Event event = Event.builder()
                .id(id)
                .shortCode(shortCode)
                .name(request.getName())
                .description(request.getDescription())
                .theme(request.getTheme())
                .contactEmail(request.getContactEmail())
                .prizes(request.getPrizes())
                .rules(request.getRules())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .registrationStartDate(request.getRegistrationStartDate())
                .registrationEndDate(request.getRegistrationEndDate())
                .judging(request.isJudging())
                .resultsDate(request.getResultsDate())
                .venue(request.getVenue())
                .isVirtual(request.isVirtual())
                .location(request.getLocation())
                .maxParticipants(request.getMaxParticipants())
                .teamSize(request.getTeamSize())
                .organizerId(request.getOrganizerId())
                .build();
        
        eventRepository.save(event);
        return id;
    }

    @Transactional
    public void updateEvent(String id, EventRequest request) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        event.setName(request.getName());
        event.setDescription(request.getDescription());
        event.setTheme(request.getTheme());
        event.setContactEmail(request.getContactEmail());
        event.setPrizes(request.getPrizes());
        event.setRules(request.getRules());
        event.setStartDate(request.getStartDate());
        event.setEndDate(request.getEndDate());
        event.setRegistrationStartDate(request.getRegistrationStartDate());
        event.setRegistrationEndDate(request.getRegistrationEndDate());
        event.setJudging(request.isJudging());
        event.setResultsDate(request.getResultsDate());
        event.setVenue(request.getVenue());
        event.setVirtual(request.isVirtual());
        event.setLocation(request.getLocation());
        event.setMaxParticipants(request.getMaxParticipants());
        event.setTeamSize(request.getTeamSize());

        eventRepository.save(event);
    }

    @Transactional
    public void deleteEvent(String id) {
        if (!eventRepository.existsById(id)) {
            throw new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage());
        }
        eventRepository.deleteById(id);
    }

    @Transactional
    public void finalizeResults(String id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        event.setJudging(false);
        eventRepository.save(event);
    }

    @Transactional
    public void addProblemStatements(String eventId, List<ProblemStatementRequest> requests) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        
        int currentCount = event.getProblemStatements().size();
        
        for (int i = 0; i < requests.size(); i++) {
            String id = restTemplate.getForObject(commonServiceUrl + "/uuid", String.class);
            String autoStatementId = String.format("PS%03d", currentCount + i + 1);
            
            ProblemStatement problem = ProblemStatement.builder()
                    .id(id)
                    .statementId(autoStatementId)
                    .statement(requests.get(i).getStatement())
                    .event(event)
                    .build();
            
            problemRepository.save(problem);
        }
    }

    @Transactional
    public void addProblemStatement(String eventId, ProblemStatementRequest request) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));
        
        String id = restTemplate.getForObject(commonServiceUrl + "/uuid", String.class);
        String autoStatementId = String.format("PS%03d", event.getProblemStatements().size() + 1);

        ProblemStatement problem = ProblemStatement.builder()
                .id(id)
                .statementId(autoStatementId)
                .statement(request.getStatement())
                .event(event)
                .build();
        
        problemRepository.save(problem);
    }

    @Transactional
    public void updateProblemStatement(String id, ProblemStatementRequest request) {
        ProblemStatement problem = problemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Problem statement not found"));
        problem.setStatement(request.getStatement());
        problemRepository.save(problem);
    }

    @Transactional
    public void deleteProblemStatement(String id) {
        problemRepository.deleteById(id);
    }

    @Transactional
    public void registerForEvent(String eventId, RegistrationRequest request) {
        if (registrationRepository.existsByEventIdAndUserId(eventId, request.getUserId())) {
            throw new RuntimeException(MessageKeys.ALREADY_REGISTERED.getMessage());
        }

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        String id = restTemplate.getForObject(commonServiceUrl + "/uuid", String.class);
        
        Registration registration = Registration.builder()
                .id(id)
                .eventId(eventId)
                .userId(request.getUserId())
                .username(request.getUsername())
                .userEmail(request.getUserEmail())
                .status(RegistrationStatus.PENDING)
                .registrationTime(LocalDateTime.now())
                .build();

        registrationRepository.save(registration);

        // Send Notification to User about pending request
        try {
            Map<String, String> emailRequest = new HashMap<>();
            emailRequest.put("to", request.getUserEmail());
            emailRequest.put("subject", "Registration Request Received: " + event.getName());
            emailRequest.put("message", "Your registration request for " + event.getName() + " is pending approval from the organizer.");
            
            restTemplate.postForEntity(notificationServiceUrl, emailRequest, String.class);
        } catch (Exception e) {
            // Log error but don't fail registration
            System.err.println("Failed to send registration notification: " + e.getMessage());
        }
    }

    public List<RegistrationResponse> getEventRegistrations(String eventId) {
        return registrationRepository.findByEventId(eventId).stream()
                .map(reg -> RegistrationResponse.builder()
                        .id(reg.getId())
                        .eventId(reg.getEventId())
                        .userId(reg.getUserId())
                        .username(reg.getUsername())
                        .userEmail(reg.getUserEmail())
                        .status(reg.getStatus())
                        .registrationTime(reg.getRegistrationTime())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void cancelRegistration(String registrationId) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException(MessageKeys.REGISTRATION_NOT_FOUND.getMessage()));
        
        registrationRepository.delete(registration);
    }

    @Transactional
    public void updateRegistrationStatus(String registrationId, RegistrationStatus status) {
        Registration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException(MessageKeys.REGISTRATION_NOT_FOUND.getMessage()));
        
        registration.setStatus(status);
        registrationRepository.save(registration);

        // Fetch event name for notification
        Event event = eventRepository.findById(registration.getEventId())
                .orElseThrow(() -> new RuntimeException(MessageKeys.EVENT_NOT_FOUND.getMessage()));

        // Send Notification to User
        try {
            Map<String, String> emailRequest = new HashMap<>();
            emailRequest.put("to", registration.getUserEmail());
            emailRequest.put("subject", "Registration " + status.name() + " for " + event.getName());
            
            String message = status == RegistrationStatus.APPROVED 
                ? "Congratulations! Your registration for " + event.getName() + " has been APPROVED."
                : "We regret to inform you that your registration for " + event.getName() + " has been REJECTED.";
            
            emailRequest.put("message", message);
            
            restTemplate.postForEntity(notificationServiceUrl, emailRequest, String.class);
        } catch (Exception e) {
            System.err.println("Failed to send status update notification: " + e.getMessage());
        }
    }
}