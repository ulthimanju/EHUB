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
        user.setFirstName(userRegistrationDto.getFirstName());
        user.setLastName(userRegistrationDto.getLastName());
        user.setRequiredActions(java.util.Collections.emptyList()); // Ensure no required actions like UPDATE_PROFILE
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

    /**
     * Deletes a user from Keycloak by username.
     * Used for rollback in case of local DB failure.
     */
    public void deleteUser(String username) {
        List<UserRepresentation> users = keycloak.realm(realm).users().search(username);
        if (!users.isEmpty()) {
            UserRepresentation user = users.stream()
                    .filter(u -> u.getUsername().equals(username))
                    .findFirst()
                    .orElse(null);

            if (user != null) {
                keycloak.realm(realm).users().get(user.getId()).remove();
                System.out.println("Rolled back (deleted) user from Keycloak: " + username);
            }
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

    @jakarta.annotation.PostConstruct
    public void init() {
        try {
            updateUserProfileConfiguration();
        } catch (Exception e) {
            System.err.println("Failed to update Keycloak UserProfile configuration: " + e.getMessage());
            // Continue, as Keycloak might not be ready or version might slightly differ
        }
    }

    private void updateUserProfileConfiguration() {
        // Fetch current configuration
        // Note: This requires the UserProfile feature to be enabled in Keycloak, which
        // is true by default in recent versions
        try {
            org.keycloak.admin.client.resource.UserProfileResource userProfileResource = keycloak.realm(realm).users()
                    .userProfile();
            org.keycloak.representations.userprofile.config.UPConfig config = userProfileResource.getConfiguration();

            boolean changed = false;

            // Make firstName optional
            if (config.getAttributes() != null) {
                for (org.keycloak.representations.userprofile.config.UPAttribute attr : config.getAttributes()) {
                    if ("firstName".equals(attr.getName()) || "lastName".equals(attr.getName())) {
                        if (attr.getRequired() != null) {
                            // In older admin-clients/representations, isRequired might be boolean or object
                            // We'll simplify by removing the required validator if simpler ways fail,
                            // but usually there's a setter or we manipulate the map

                            // Adjusting requirements: Set required to false (if setter exists) or remove it
                            // Note: Implementation details depend on the exact Keycloak client version
                            // structure.
                            // For 24.x, UPAttribute has setRequired(UPAttributeRequired)

                            attr.setRequired(null); // Make it optional
                            changed = true;
                            System.out.println("Made " + attr.getName() + " optional in Keycloak UserProfile.");
                        }
                    }
                }
            }

            if (changed) {
                userProfileResource.update(config);
                System.out.println("Keycloak UserProfile configuration updated successfully.");
            }
        } catch (Exception e) {
            // If API not found or failed, log it. common if feature disabled or client
            // mismatch.
            System.out.println("Warning: Could not configure UserProfile via API (may be disabled or unnecessary): "
                    + e.getMessage());
        }
    }

}
