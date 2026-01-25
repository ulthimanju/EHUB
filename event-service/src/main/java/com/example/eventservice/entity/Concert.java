package com.example.eventservice.entity;

import jakarta.persistence.Entity;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
public class Concert extends Event {
    private String artist;
    private String genre;
    private Integer ticketsSold;
    private BigDecimal ticketPrice;
}
