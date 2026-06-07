package com.prestalink.api.mission;

import com.prestalink.api.request.ServiceRequest;
import com.prestalink.api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "missions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private MissionStatus status;

    private LocalDateTime startedAt;

    private LocalDateTime finishedAt;

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    @ManyToOne
    @JoinColumn(name = "provider_id")
    private User provider;

    @ManyToOne
    @JoinColumn(name = "request_id")
    private ServiceRequest request;

    @PrePersist
    public void onCreate() {
        if (status == null) {
            status = MissionStatus.EN_COURS;
        }

        if (startedAt == null) {
            startedAt = LocalDateTime.now();
        }
    }
}
