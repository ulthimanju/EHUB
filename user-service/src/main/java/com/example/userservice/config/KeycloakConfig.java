package com.example.userservice.config;

import org.jboss.resteasy.client.jaxrs.ResteasyClientBuilder;
import org.keycloak.OAuth2Constants;
import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.KeycloakBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.ws.rs.client.ClientBuilder;

@Configuration
public class KeycloakConfig {

    @Value("${keycloak.server-url}")
    private String serverUrl;

    @Value("${keycloak.realm}")
    private String realm;

    @Value("${keycloak.resource}")
    private String clientId;

    @Value("${keycloak.username}")
    private String username;

    @Value("${keycloak.password}")
    private String password;

    @Bean
    public Keycloak keycloak() {
        return KeycloakBuilder.builder()
                .serverUrl(serverUrl)
                .realm("master") // Admin token is retrieved from master realm
                .grantType(OAuth2Constants.PASSWORD)
                .clientId(clientId) // "admin-cli"
                .username(username)
                .password(password)
                .resteasyClient(((ResteasyClientBuilder) ClientBuilder.newBuilder())
                        .connectionPoolSize(10) // Optimize connection pool
                        .build())
                .build();
    }
}
