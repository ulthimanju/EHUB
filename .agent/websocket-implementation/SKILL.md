---
name: websocket-implementation
description: Provides comprehensive instructions for implementing WebSocket communication in Spring Boot applications for real-time bidirectional messaging. Use this when the developer needs guidance on WebSocket configuration, STOMP protocol, message broadcasting, and real-time features.
---

# WebSocket Implementation in Spring Boot

## Add Dependencies
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
```

## WebSocket Configuration
```java
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {
    
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }
    
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("*")
                .withSockJS();
    }
}
```

## Message Controller
```java
@Controller
public class ChatController {
    
    @MessageMapping("/chat.send")
    @SendTo("/topic/messages")
    public ChatMessage sendMessage(ChatMessage message) {
        message.setTimestamp(LocalDateTime.now());
        return message;
    }
    
    @MessageMapping("/chat.addUser")
    @SendTo("/topic/users")
    public ChatMessage addUser(@Payload ChatMessage message, 
                               SimpMessageHeaderAccessor headerAccessor) {
        headerAccessor.getSessionAttributes().put("username", message.getSender());
        return message;
    }
}
```

## Send Messages from Service
```java
@Service
public class NotificationService {
    
    @Autowired
    private SimpMessagingTemplate messagingTemplate;
    
    public void sendToUser(String username, Notification notification) {
        messagingTemplate.convertAndSendToUser(
            username, 
            "/queue/notifications", 
            notification
        );
    }
    
    public void broadcastToAll(Notification notification) {
        messagingTemplate.convertAndSend(
            "/topic/notifications", 
            notification
        );
    }
}
```

## Message Models
```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessage {
    private String sender;
    private String content;
    private MessageType type;
    private LocalDateTime timestamp;
}

public enum MessageType {
    CHAT, JOIN, LEAVE
}
```

## Client-Side JavaScript
```javascript
let stompClient = null;

function connect() {
    const socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    
    stompClient.connect({}, function(frame) {
        console.log('Connected: ' + frame);
        
        stompClient.subscribe('/topic/messages', function(message) {
            showMessage(JSON.parse(message.body));
        });
    });
}

function sendMessage(content) {
    stompClient.send("/app/chat.send", {}, JSON.stringify({
        sender: username,
        content: content,
        type: 'CHAT'
    }));
}

function disconnect() {
    if (stompClient !== null) {
        stompClient.disconnect();
    }
}
```

## Security Configuration
```java
@Configuration
public class WebSocketSecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf().disable()
            .authorizeHttpRequests()
            .requestMatchers("/ws/**").permitAll();
        return http.build();
    }
}
```

## Event Listeners
```java
@Component
public class WebSocketEventListener {
    
    @Autowired
    private SimpMessageSendingOperations messagingTemplate;
    
    @EventListener
    public void handleWebSocketConnectListener(SessionConnectedEvent event) {
        log.info("New WebSocket connection");
    }
    
    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        String username = (String) headerAccessor.getSessionAttributes().get("username");
        
        if (username != null) {
            ChatMessage leaveMessage = new ChatMessage();
            leaveMessage.setType(MessageType.LEAVE);
            leaveMessage.setSender(username);
            
            messagingTemplate.convertAndSend("/topic/users", leaveMessage);
        }
    }
}
```

## Best Practices

- Use `/topic` for broadcast to all subscribers
- Use `/queue` for point-to-point messaging
- Implement proper authentication with WebSocket interceptors
- Handle connection errors and implement reconnection logic
- Use heartbeat to detect dead connections
- Validate and sanitize all incoming messages
- Implement rate limiting to prevent abuse