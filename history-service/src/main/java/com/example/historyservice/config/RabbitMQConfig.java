package com.example.historyservice.config;

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

    public static final String QUEUE_HISTORY = "history.queue";
    // We listen to exchanges defined in other services
    public static final String EXCHANGE_USER = "user.exchange";
    public static final String EXCHANGE_EVENT = "event.exchange";

    @Bean
    public Queue historyQueue() {
        return new Queue(QUEUE_HISTORY);
    }

    // We only need to define the exchanges here to bind to them, 
    // strictly speaking we assume they exist, but declaring them is safe (idempotent)
    @Bean
    public TopicExchange userExchange() {
        return new TopicExchange(EXCHANGE_USER);
    }

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(EXCHANGE_EVENT);
    }

    @Bean
    public Binding bindingUserRegistered(Queue historyQueue, TopicExchange userExchange) {
        return BindingBuilder.bind(historyQueue).to(userExchange).with("user.registered.#");
    }

    @Bean
    public Binding bindingEventCreated(Queue historyQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(historyQueue).to(eventExchange).with("event.created.#");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
