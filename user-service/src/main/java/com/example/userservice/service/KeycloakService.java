package com.example.userservice.service;

import java.util.List;

import org.keycloak.admin.client.Keycloak;
import org.keycloak.admin.client.resource.UsersResource;
import org.keycloak.representations.idm.CredentialRepresentation;
import org.keycloak.representations.idm.UserRepresentation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.userservice.dto.UserRegistrationDto;

import jakarta.ws.rs.core.Response;

@Service
public class KeycloakService {

    private final Keycloak keycloak;

    @Value("${keycloak.realm}")
    private String realm;

    public KeycloakService(Keycloak keycloak) {
        this.keycloak = keycloak;
    }

    public void createUser(UserRegistrationDto userRegistrationDto) {
        UserRepresentation user = new UserRepresentation();
        user.setEnabled(true);
        user.setUsername(userRegistrationDto.getUsername());
        user.setEmail(userRegistrationDto.getEmail());
        user.setEmailVerified(true); // Auto-verify email for now

        CredentialRepresentation credentialRepresentation = new CredentialRepresentation();
        credentialRepresentation.setValue(userRegistrationDto.getPassword());
        credentialRepresentation.setTemporary(false);
        credentialRepresentation.setType(CredentialRepresentation.PASSWORD);

        user.setCredentials(List.of(credentialRepresentation));

        UsersResource usersResource = keycloak.realm(realm).users();
        Response response = usersResource.create(user);

        if (response.getStatus() != 201) {
            throw new RuntimeException("Failed to create user in Keycloak. Status: " + response.getStatus() + " Info: "
                    + response.getStatusInfo());
        }
    }

    public void resetPassword(String username, String newPassword) {
        List<UserRepresentation> users = keycloak.realm(realm).users().search(username);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found in Keycloak: " + username);
        }
        // Ensure exact match
        UserRepresentation user = users.stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found in Keycloak (exact match): " + username));

        CredentialRepresentation credential = new CredentialRepresentation();
        credential.setType(CredentialRepresentation.PASSWORD);
        credential.setValue(newPassword);
        credential.setTemporary(false);

        keycloak.realm(realm).users().get(user.getId()).resetPassword(credential);
    }

    public void assignRole(String username, String roleName) {
        // 1. Get user
        List<UserRepresentation> users = keycloak.realm(realm).users().search(username);
        if (users.isEmpty()) {
            throw new RuntimeException("User not found in Keycloak: " + username);
        }
        UserRepresentation user = users.stream()
                .filter(u -> u.getUsername().equals(username))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("User not found in Keycloak (exact match): " + username));

        // 2. Get or Create Role
        org.keycloak.representations.idm.RoleRepresentation role;
        try {
            role = keycloak.realm(realm).roles().get(roleName).toRepresentation();
        } catch (jakarta.ws.rs.NotFoundException e) {
            // Role doesn't exist, create it
            System.out.println("Role " + roleName + " not found, creating it...");
            org.keycloak.representations.idm.RoleRepresentation newRole = new org.keycloak.representations.idm.RoleRepresentation();
            newRole.setName(roleName);
            newRole.setDescription("Auto-created role: " + roleName);
            keycloak.realm(realm).roles().create(newRole);
            role = keycloak.realm(realm).roles().get(roleName).toRepresentation();
            System.out.println("Role " + roleName + " created successfully.");
        }

        // 3. Assign Role to User
        keycloak.realm(realm).users().get(user.getId()).roles().realmLevel().add(List.of(role));
        System.out.println("Role " + roleName + " assigned to user " + username);
    }
}
