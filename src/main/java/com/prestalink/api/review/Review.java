package com.prestalink.api.review;

import com.prestalink.api.mission.Mission;
import com.prestalink.api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer rating;

    @Column(length = 1000)
    private String comment;

    private LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private User provider;

    @OneToOne
    @JoinColumn(name = "mission_id")
    private Mission mission;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
