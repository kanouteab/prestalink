package com.prestalink.api.provider;

import com.prestalink.api.review.ReviewResponse;
import com.prestalink.api.user.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ProviderTrustProfile {
    private UserResponse provider;
    private Double ratingAverage;
    private Integer ratingCount;
    private Double trustScore;
    private Integer completedServices;
    private Boolean newProvider;
    private Boolean verifiedProfile;
    private Boolean selectable;
    private String accountStatusLabel;
    private String emptyReviewMessage;
    private List<ReviewResponse> reviews;
}

