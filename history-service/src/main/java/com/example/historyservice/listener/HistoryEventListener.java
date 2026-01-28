package com.example.historyservice.listener;

import java.time.LocalDateTime;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.example.common.event.EventCreatedEvent;
import com.example.common.event.UserRegisteredEvent;
import com.example.historyservice.config.RabbitMQConfig;
import com.example.historyservice.entity.UserHistory;
import com.example.historyservice.repository.UserHistoryRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
@RabbitListener(queues = RabbitMQConfig.QUEUE_HISTORY)
public class HistoryEventListener {

    private final UserHistoryRepository userHistoryRepository;
    private final ObjectMapper objectMapper;

    public HistoryEventListener(UserHistoryRepository userHistoryRepository, ObjectMapper objectMapper) {
        this.userHistoryRepository = userHistoryRepository;
        this.objectMapper = objectMapper;
    }

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void handleUserRegistered(UserRegisteredEvent event) {
        log.info("Received UserRegisteredEvent: {}", event);
        saveHistory(
                event.getUsername(),
                "USER_REGISTERED",
                "User registered with email: " + event.getEmail(),
                event);
    }

    @org.springframework.amqp.rabbit.annotation.RabbitHandler
    public void handleEventCreated(EventCreatedEvent event) {
        log.info("Received EventCreatedEvent: {}", event);
        saveHistory(
                event.getOrganizerId(),
                "EVENT_CREATED",
                "Created event: " + event.getTitle(),
                event);
    }
    
    // Note: Since both listeners listen to the same queue, we usually separate queues 
    // or use a single listener with instance checks / header routing.
    // However, keeping it simple: The RabbitTemplate uses a specific convertAndSend.
    // If we bind multiple routing keys to THE SAME QUEUE, we need to handle type mapping carefully.
    // Spring AMQP Jackson2JsonMessageConverter usually puts a __TypeId__ header.
    // So separate methods with @RabbitHandler inside a @RabbitListener class is better, 
    // OR separate queues. Here, we'll assume separate routing keys route to the same queue 
    // and Spring decodes them. Wait, if we use one queue for multiple types, 
    // we need @RabbitListener on the CLASS and @RabbitHandler on methods.
    
    // Let's refactor to use @RabbitListener at class level for safety.

    private void saveHistory(String userId, String action, String description, Object payload) {
        try {
            UserHistory history = new UserHistory();
            history.setUserId(userId);
            history.setActionType(action);
            history.setDescription(description);
            history.setTimestamp(LocalDateTime.now());
            history.setMetadata(objectMapper.writeValueAsString(payload)); // Store full event payload as JSON
            
            userHistoryRepository.save(history);
            log.info("Saved history for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to save history", e);
        }
    }
}
