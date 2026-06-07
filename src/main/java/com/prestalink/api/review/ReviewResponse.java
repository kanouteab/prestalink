package com.prestalink.api.review;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long missionId;
    private Long clientId;
    private String clientName;
    private Long providerId;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}

