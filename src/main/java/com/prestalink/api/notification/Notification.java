package com.prestalink.api.notification;

import com.prestalink.api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "notifications")
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String type;

    private String title;

    private String message;

    private Boolean isRead;

    private LocalDateTime createdAt;

    private Long relatedPublicationId;

    private Long actorUserId;

    @ManyToOne
    private User user;

    @Enumerated(EnumType.STRING)
    private NotificationPriority priority;
}

