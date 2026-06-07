package com.prestalink.api.history;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ServiceHistoryItemResponse {
    private Long id;
    private String direction;
    private String title;
    private String description;
    private HistoryStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;
    private LocalDateTime cancelledAt;
    private Long providerId;
    private String providerName;
    private Long clientId;
    private String clientName;
    private Long otherUserId;
    private String otherUserName;
    private Long offerId;
    private Long requestId;
    private String publicationType;
}

