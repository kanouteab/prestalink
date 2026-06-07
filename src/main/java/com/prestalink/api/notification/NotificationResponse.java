package com.prestalink.api.notification;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private Long userId;
    private Long relatedPublicationId;
    private Long actorUserId;
    private NotificationPriority priority;

}

