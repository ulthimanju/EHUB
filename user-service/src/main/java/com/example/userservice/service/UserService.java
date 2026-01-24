package com.example.userservice.service;

import java.lang.reflect.Field;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.util.ReflectionUtils;

import com.example.userservice.dto.UserDTO;
import com.example.userservice.dto.UserRegistrationDto;
import com.example.userservice.entity.User;
import com.example.userservice.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final KeycloakService keycloakService;

    public UserService(UserRepository userRepository, KeycloakService keycloakService) {
        this.userRepository = userRepository;
        this.keycloakService = keycloakService;
    }

    public UserDTO registerUser(UserRegistrationDto registrationDto) {
        // 1. Create user in Keycloak
        keycloakService.createUser(registrationDto);

        // 2. Create user in local DB
        User user = new User();
        user.setUsername(registrationDto.getUsername());
        user.setEmail(registrationDto.getEmail());
        // Password is NOT saved locally

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public UserDTO saveUser(User user) {
        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.example.common.exception.ResourceNotFoundException("User", "id", id));
        return mapToDTO(user);
    }

    public UserDTO updateUser(Long id, Map<String, Object> updates) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new com.example.common.exception.ResourceNotFoundException("User", "id", id));

        updates.forEach((key, value) -> {
            Field field = ReflectionUtils.findField(User.class, key);
            if (field != null) {
                field.setAccessible(true);
                ReflectionUtils.setField(field, user, value);
            }
        });

        User savedUser = userRepository.save(user);
        return mapToDTO(savedUser);
    }

    public UserDTO syncUser(String username, String email, String firstName, String lastName) {
        return userRepository.findByUsername(username)
                .map(this::mapToDTO)
                .orElseGet(() -> {
                    User user = new User();
                    user.setUsername(username);
                    user.setEmail(email);
                    user.setFirstName(firstName);
                    user.setLastName(lastName);
                    return mapToDTO(userRepository.save(user));
                });
    }

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(java.util.stream.Collectors.toList());
    }

    private UserDTO mapToDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getAddress());
    }
}
