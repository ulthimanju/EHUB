package com.example.userservice.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserRegistrationDto;
import com.example.userservice.service.UserService;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserDTO> registerUser(@RequestBody UserRegistrationDto registrationDto) {
        return ResponseEntity.ok(userService.registerUser(registrationDto));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser(java.security.Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(401).build();
        }

        String username = principal.getName();
        String email = null;
        String firstName = null;
        String lastName = null;

        if (principal instanceof org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken) {
            org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken token = (org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken) principal;
            Map<String, Object> attributes = token.getTokenAttributes();

            String preferredUsername = (String) attributes.get("preferred_username");
            if (preferredUsername != null) {
                username = preferredUsername;
            }

            email = (String) attributes.get("email");
            firstName = (String) attributes.get("given_name");
            lastName = (String) attributes.get("family_name");
        }

        return ResponseEntity.ok(userService.syncUser(username, email, firstName, lastName));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Long id, @RequestBody Map<String, Object> updates) {
        return ResponseEntity.ok(userService.updateUser(id, updates));
    }

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
}
