package com.example.userservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String QUEUE_USER_REGISTERED = "user.registered.queue";
    public static final String EXCHANGE_USER = "user.exchange";
    public static final String ROUTING_KEY_USER_REGISTERED = "user.registered.key";

    @Bean
    public Queue userRegisteredQueue() {
        return new Queue(QUEUE_USER_REGISTERED);
    }

    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(EXCHANGE_USER);
    }

    @Bean
    public Binding binding(Queue userRegisteredQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(userRegisteredQueue).to(userExchange).with(ROUTING_KEY_USER_REGISTERED);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
