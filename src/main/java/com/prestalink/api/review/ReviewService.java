package com.prestalink.api.review;

import com.prestalink.api.mission.Mission;
import com.prestalink.api.mission.MissionRepository;
import com.prestalink.api.mission.MissionStatus;
import com.prestalink.api.notification.NotificationService;
import com.prestalink.api.notification.NotificationType;
import com.prestalink.api.provider.ProviderTrustService;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final MissionRepository missionRepository;
    private final UserRepository userRepository;
    private final ProviderTrustService providerTrustService;
    private final NotificationService notificationService;

    public Review createReview(ReviewRequest request) {
        return createReview(request, null);
    }

    public Review createReviewForProvider(Long providerId, ReviewRequest request) {
        return createReview(request, providerId);
    }

    private Review createReview(ReviewRequest request, Long expectedProviderId) {
        Mission mission = missionRepository.findById(request.getMissionId())
                .orElseThrow(() -> new RuntimeException("Mission introuvable"));

        if (expectedProviderId != null && !mission.getProvider().getId().equals(expectedProviderId)) {
            throw new RuntimeException("Cette évaluation ne correspond pas au prestataire ciblé");
        }

        if (mission.getStatus() != MissionStatus.TERMINEE) {
            throw new RuntimeException("Impossible de noter une mission non terminée");
        }

        if (reviewRepository.findByMissionId(mission.getId()).isPresent()) {
            throw new RuntimeException("Cette mission a déjà été notée");
        }

        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new RuntimeException("La note doit être entre 1 et 5");
        }

        if (mission.getClient().getId().equals(mission.getProvider().getId())) {
            throw new RuntimeException("Un prestataire ne peut pas s’auto-évaluer");
        }

        Review review = Review.builder()
                .mission(mission)
                .client(mission.getClient())
                .provider(mission.getProvider())
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review savedReview = reviewRepository.save(review);

        providerTrustService.refreshProviderRating(mission.getProvider());
        notificationService.createNotification(
                mission.getProvider().getId(),
                NotificationType.NEW_RATING.name(),
                notificationService.messageFor(NotificationType.NEW_RATING),
                notificationService.messageFor(NotificationType.NEW_RATING),
                mission.getRequest() != null ? mission.getRequest().getId() : null,
                mission.getClient().getId()
        );

        if (request.getComment() != null && !request.getComment().trim().isEmpty()) {
            notificationService.createNotification(
                    mission.getProvider().getId(),
                    NotificationType.NEW_COMMENT.name(),
                    notificationService.messageFor(NotificationType.NEW_COMMENT),
                    notificationService.messageFor(NotificationType.NEW_COMMENT),
                    mission.getRequest() != null ? mission.getRequest().getId() : null,
                    mission.getClient().getId()
            );
        }

        return savedReview;
    }

    public List<Review> getProviderReviews(Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Prestataire introuvable"));

        return reviewRepository.findByProvider(provider);
    }

    public List<ReviewResponse> getProviderReviewResponses(Long providerId) {
        return providerTrustService.getProviderReviewResponses(providerId);
    }

    public RatingSummary getRatingSummary(Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Prestataire introuvable"));
        int ratingCount = provider.getRatingCount() != null ? provider.getRatingCount() : 0;
        double average = provider.getRatingAverage() != null ? provider.getRatingAverage() : 0.0;

        return RatingSummary.builder()
                .providerId(providerId)
                .ratingAverage(average)
                .ratingCount(ratingCount)
                .newProvider(ratingCount == 0)
                .label(ratingCount == 0 ? "Nouveau prestataire" : String.format("%.1f/5, %d avis", average, ratingCount))
                .emptyReviewMessage("Aucun commentaire pour ce prestataire actuellement")
                .build();
    }
}

