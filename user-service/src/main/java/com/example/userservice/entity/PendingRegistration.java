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
 * Pending registration entity for OTP-based registration flow.
 * Uses Instant for timestamps and extends BaseEntity.
 */
@Entity
@Table(name = "pending_registrations", indexes = {
        @Index(name = "idx_pending_email", columnList = "email"),
        @Index(name = "idx_pending_username", columnList = "username")
})
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class PendingRegistration extends BaseEntity {

    @Id
    @com.example.common.id.SnowflakeId
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    private String otp;
    private Instant otpExpiry;

    // createdAt is inherited from BaseEntity now, but we need to make sure it's
    // populated.
    // BaseEntity uses @CreatedDate with
    // @EntityListeners(AuditingEntityListener.class)
    // We need to enable JPA auditing in the main application class or config.
}
