package com.prestalink.api.review;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RatingSummary {
    private Long providerId;
    private Double ratingAverage;
    private Integer ratingCount;
    private Boolean newProvider;
    private String label;
    private String emptyReviewMessage;
}

