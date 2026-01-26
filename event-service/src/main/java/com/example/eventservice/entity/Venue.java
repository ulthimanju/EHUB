package com.example.eventservice.entity;

import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.BatchSize;

import com.example.common.entity.BaseEntity;

import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Venue extends BaseEntity {
    @Id
    @com.example.common.id.SnowflakeId
    private Long venueId;

    private String venueName;
    private String address;
    private Integer capacity;

    @ElementCollection
    @BatchSize(size = 20)
    private Set<String> facilities = new HashSet<>();
}
