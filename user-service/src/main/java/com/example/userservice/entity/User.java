package com.example.userservice.entity;

import java.time.Instant;

import com.example.common.entity.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

/**
 * User entity with optimized database indexes and Instant for timestamps.
 * Extends BaseEntity for audit fields.
 */
@Entity
@Table(name = "users", indexes = {
        @Index(name = "idx_user_username", columnList = "username"),
        @Index(name = "idx_user_email", columnList = "email")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class User extends BaseEntity {

    @Id
    @com.example.common.id.SnowflakeId
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private String role;

    private String otp;
    private Instant otpExpiry;

    public void promoteToOrganizer() {
        this.role = "ORGANIZER"; // Ensure this matches constant in AppConstants, currently using string literal
                                 // to avoid dependency here
        this.otp = null;
        this.otpExpiry = null;
    }
}
