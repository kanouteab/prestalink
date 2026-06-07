package com.prestalink.api.review;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    public Review createReview(@RequestBody ReviewRequest request) {
        return reviewService.createReview(request);
    }

    @GetMapping("/provider/{providerId}")
    public List<Review> getProviderReviews(@PathVariable Long providerId) {
        return reviewService.getProviderReviews(providerId);
    }

    @GetMapping("/provider/{providerId}/summary")
    public RatingSummary getRatingSummary(@PathVariable Long providerId) {
        return reviewService.getRatingSummary(providerId);
    }
}

