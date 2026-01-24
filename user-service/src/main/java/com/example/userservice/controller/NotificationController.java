package com.example.userservice.controller;

import java.util.Map;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;

@Controller
@CrossOrigin(origins = "*")
public class NotificationController {

    @MessageMapping("/sendMessage")
    @SendTo("/topic/notifications")
    public Map<String, String> sendMessage(Map<String, String> message) {
        return message;
    }
}
