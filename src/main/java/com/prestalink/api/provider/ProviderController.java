package com.prestalink.api.provider;

import com.prestalink.api.review.RatingSummary;
import com.prestalink.api.review.ReviewRequest;
import com.prestalink.api.review.ReviewResponse;
import com.prestalink.api.review.ReviewService;
import com.prestalink.api.user.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/providers")
@RequiredArgsConstructor
public class ProviderController {

    private final ProviderTrustService providerTrustService;
    private final ReviewService reviewService;

    @GetMapping("/recommended")
    public List<UserResponse> getRecommendedProviders(
            @RequestParam(required = false) String location
    ) {
        return providerTrustService.getRecommendedProviders(location);
    }

    @PostMapping("/{providerId}/reviews")
    public ReviewResponse createProviderReview(
            @PathVariable Long providerId,
            @RequestBody ReviewRequest request
    ) {
        return providerTrustService.toReviewResponse(reviewService.createReviewForProvider(providerId, request));
    }

    @GetMapping("/{providerId}/reviews")
    public List<ReviewResponse> getProviderReviews(@PathVariable Long providerId) {
        return reviewService.getProviderReviewResponses(providerId);
    }

    @GetMapping("/{providerId}/rating-summary")
    public RatingSummary getRatingSummary(@PathVariable Long providerId) {
        return reviewService.getRatingSummary(providerId);
    }

    @GetMapping("/{providerId}/trust-profile")
    public ProviderTrustProfile getTrustProfile(@PathVariable Long providerId) {
        return providerTrustService.getTrustProfile(providerId);
    }

    @PutMapping("/{providerId}/penalty")
    public UserResponse applyPenalty(
            @PathVariable Long providerId,
            @RequestBody ProviderPenaltyRequest request
    ) {
        return providerTrustService.toUserResponse(providerTrustService.applyPenalty(providerId, request));
    }
}

