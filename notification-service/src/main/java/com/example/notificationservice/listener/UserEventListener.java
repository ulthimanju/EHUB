package com.example.notificationservice.listener;

import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import com.example.common.event.UserRegisteredEvent;
import com.example.notificationservice.config.RabbitMQConfig;

@Component
public class UserEventListener {

    @RabbitListener(queues = RabbitMQConfig.QUEUE_USER_REGISTERED)
    public void handleUserRegisteredEvent(UserRegisteredEvent event) {
        System.out.println("Received UserRegisteredEvent for user: " + event.getUsername());
        System.out.println("Ideally, we would send a Welcome Email here to: " + event.getEmail());
    }
}
