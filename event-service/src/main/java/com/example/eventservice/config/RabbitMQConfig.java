package com.example.eventservice.config;

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

    public static final String QUEUE_EVENT_CREATED = "event.created.queue";
    public static final String EXCHANGE_EVENT = "event.exchange";
    public static final String ROUTING_KEY_EVENT_CREATED = "event.created.key";

    @Bean
    public Queue eventCreatedQueue() {
        return new Queue(QUEUE_EVENT_CREATED);
    }

    @Bean
    public TopicExchange eventExchange() {
        return new TopicExchange(EXCHANGE_EVENT);
    }

    @Bean
    public Binding binding(Queue eventCreatedQueue, TopicExchange eventExchange) {
        return BindingBuilder.bind(eventCreatedQueue).to(eventExchange).with(ROUTING_KEY_EVENT_CREATED);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
