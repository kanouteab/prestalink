package com.prestalink.api.provider;

import com.prestalink.api.mission.MissionRepository;
import com.prestalink.api.mission.MissionStatus;
import com.prestalink.api.review.Review;
import com.prestalink.api.review.ReviewRepository;
import com.prestalink.api.review.ReviewResponse;
import com.prestalink.api.user.AccountStatus;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import com.prestalink.api.user.UserResponse;
import com.prestalink.api.user.UserRole;
import com.prestalink.api.user.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProviderTrustService {

    private static final double NEW_PROVIDER_NEUTRAL_RATING = 3.5;

    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final MissionRepository missionRepository;

    public boolean isProviderSelectable(User provider) {
        return provider != null
                && provider.getRole() == UserRole.PRESTATAIRE
                && getEffectiveAccountStatus(provider) == AccountStatus.ACTIF;
    }

    public AccountStatus getEffectiveAccountStatus(User provider) {
        LocalDateTime now = LocalDateTime.now();

        if (provider.getSuspendedUntil() != null && provider.getSuspendedUntil().isAfter(now)) {
            return AccountStatus.COMPTE_SUSPENDU_TEMPORAIRE;
        }

        if (provider.getFrozenUntil() != null && provider.getFrozenUntil().isAfter(now)) {
            return AccountStatus.COMPTE_GELE_TEMPORAIRE;
        }

        return AccountStatus.ACTIF;
    }

    public Comparator<User> providerComparator(String location) {
        return Comparator
                .comparing((User provider) -> locationPriority(provider, location))
                .thenComparing(provider -> statusPriority(provider.getStatus()))
                .thenComparing(provider -> isVerifiedProfile(provider) ? 0 : 1)
                .thenComparing((User provider) -> effectiveRating(provider), Comparator.reverseOrder())
                .thenComparing((User provider) -> safeInt(provider.getRatingCount()), Comparator.reverseOrder())
                .thenComparing((User provider) -> safeInt(provider.getCompletedServices()), Comparator.reverseOrder())
                .thenComparing((User provider) -> safeDouble(provider.getTrustScore()), Comparator.reverseOrder())
                .thenComparing(User::getId);
    }

    public int locationPriority(User provider, String location) {
        if (isBlank(location)) {
            return 2;
        }

        String normalizedLocation = normalize(location);
        String providerLocality = normalize(provider.getStreetAddress() + " " + provider.getPostalCode() + " " + provider.getCountry());

        if (!providerLocality.isBlank() && providerLocality.contains(normalizedLocation)) {
            return 0;
        }

        if (!isBlank(provider.getCountry()) && normalizedLocation.contains(normalize(provider.getCountry()))) {
            return 1;
        }

        return 2;
    }

    public double effectiveRating(User provider) {
        int ratingCount = safeInt(provider.getRatingCount());

        if (ratingCount == 0) {
            return NEW_PROVIDER_NEUTRAL_RATING;
        }

        return safeDouble(provider.getRatingAverage());
    }

    public UserResponse toUserResponse(User user) {
        AccountStatus status = getEffectiveAccountStatus(user);
        int ratingCount = safeInt(user.getRatingCount());
        boolean isProvider = user.getRole() == UserRole.PRESTATAIRE;

        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .latitude(user.getLatitude())
                .longitude(user.getLongitude())
                .rating(user.getRating())
                .ratingAverage(safeDouble(user.getRatingAverage()))
                .ratingCount(ratingCount)
                .trustScore(safeDouble(user.getTrustScore()))
                .completedServices(safeInt(user.getCompletedServices()))
                .verifiedProfile(isVerifiedProfile(user))
                .emailVerified(Boolean.TRUE.equals(user.getEmailVerified()))
                .emailVerifiedAt(user.getEmailVerifiedAt() != null ? user.getEmailVerifiedAt().toString() : null)
                .phoneVerified(Boolean.TRUE.equals(user.getPhoneVerified()))
                .phoneVerifiedAt(user.getPhoneVerifiedAt() != null ? user.getPhoneVerifiedAt().toString() : null)
                .fullyVerifiedProfile(isFullyVerifiedProfile(user))
                .accountStatus(status)
                .accountStatusLabel(accountStatusLabel(status))
                .frozenUntil(user.getFrozenUntil() != null ? user.getFrozenUntil().toString() : null)
                .suspendedUntil(user.getSuspendedUntil() != null ? user.getSuspendedUntil().toString() : null)
                .penaltyCount(safeInt(user.getPenaltyCount()))
                .lastPenaltyReason(user.getLastPenaltyReason())
                .country(user.getCountry())
                .city(user.getCity())
                .streetAddress(user.getStreetAddress())
                .postalCode(user.getPostalCode())
                .photoUrl(user.getPhotoUrl())
                .newProvider(isProvider && ratingCount == 0)
                .selectable(!isProvider || isProviderSelectable(user))
                .trustBadge(isProvider ? trustBadge(user) : null)
                .build();
    }

    public ProviderTrustProfile getTrustProfile(Long providerId) {
        User provider = getProvider(providerId);
        List<ReviewResponse> reviews = getProviderReviewResponses(providerId);

        return ProviderTrustProfile.builder()
                .provider(toUserResponse(provider))
                .ratingAverage(safeDouble(provider.getRatingAverage()))
                .ratingCount(safeInt(provider.getRatingCount()))
                .trustScore(safeDouble(provider.getTrustScore()))
                .completedServices(safeInt(provider.getCompletedServices()))
                .newProvider(safeInt(provider.getRatingCount()) == 0)
                .verifiedProfile(isVerifiedProfile(provider))
                .selectable(isProviderSelectable(provider))
                .accountStatusLabel(accountStatusLabel(getEffectiveAccountStatus(provider)))
                .emptyReviewMessage("Aucun commentaire pour ce prestataire actuellement")
                .reviews(reviews)
                .build();
    }

    public List<UserResponse> getRecommendedProviders(String location) {
        return userRepository.findByRole(UserRole.PRESTATAIRE)
                .stream()
                .filter(this::isProviderSelectable)
                .sorted(providerComparator(location))
                .map(this::toUserResponse)
                .toList();
    }

    public User applyPenalty(Long providerId, ProviderPenaltyRequest request) {
        User provider = getProvider(providerId);
        int severityScore = request.getSeverityScore() != null ? request.getSeverityScore() : -3;

        if (severityScore <= -3) {
            int currentPenaltyCount = safeInt(provider.getPenaltyCount());
            provider.setPenaltyCount(currentPenaltyCount + 1);

            if (currentPenaltyCount == 0) {
                provider.setFrozenUntil(LocalDateTime.now().plusDays(15));
                provider.setAccountStatus(AccountStatus.COMPTE_GELE_TEMPORAIRE);
            } else {
                provider.setSuspendedUntil(LocalDateTime.now().plusMonths(1));
                provider.setAccountStatus(AccountStatus.COMPTE_SUSPENDU_TEMPORAIRE);
            }
        }

        provider.setLastPenaltyReason(request.getReason());
        provider.setTrustScore(Math.max(0.0, safeDouble(provider.getTrustScore()) + severityScore * 10.0));

        return userRepository.save(provider);
    }

    public void refreshProviderRating(User provider) {
        List<Review> reviews = reviewRepository.findByProvider(provider);
        int ratingCount = reviews.size();
        double average = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        long completedServices = missionRepository.countByProviderAndStatus(provider, MissionStatus.TERMINEE);
        double trustScore = computeTrustScore(average, ratingCount, completedServices, provider);

        provider.setRating(average);
        provider.setRatingAverage(average);
        provider.setRatingCount(ratingCount);
        provider.setCompletedServices((int) completedServices);
        provider.setTrustScore(trustScore);

        userRepository.save(provider);
    }

    public List<ReviewResponse> getProviderReviewResponses(Long providerId) {
        User provider = getProvider(providerId);

        return reviewRepository.findByProviderOrderByCreatedAtDesc(provider)
                .stream()
                .map(this::toReviewResponse)
                .toList();
    }

    public ReviewResponse toReviewResponse(Review review) {
        return ReviewResponse.builder()
                .id(review.getId())
                .missionId(review.getMission() != null ? review.getMission().getId() : null)
                .clientId(review.getClient() != null ? review.getClient().getId() : null)
                .clientName(review.getClient() != null ? review.getClient().getFullName() : "Client")
                .providerId(review.getProvider() != null ? review.getProvider().getId() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    public String accountStatusLabel(AccountStatus status) {
        return switch (status) {
            case COMPTE_GELE_TEMPORAIRE -> "Compte gelé temporairement";
            case COMPTE_SUSPENDU_TEMPORAIRE -> "Compte suspendu temporairement";
            case ACTIF -> "Compte actif";
        };
    }

    private User getProvider(Long providerId) {
        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Prestataire introuvable"));

        if (provider.getRole() != UserRole.PRESTATAIRE) {
            throw new RuntimeException("Cet utilisateur n’est pas un prestataire");
        }

        return provider;
    }

    private double computeTrustScore(double average, int ratingCount, long completedServices, User provider) {
        double ratingComponent = ratingCount == 0 ? 35.0 : average * 12.0;
        double reviewComponent = Math.min(ratingCount, 30) * 0.8;
        double serviceComponent = Math.min(completedServices, 50) * 0.5;
        double verifiedComponent = isFullyVerifiedProfile(provider) ? 12.0 : isVerifiedProfile(provider) ? 8.0 : 0.0;
        double penaltyComponent = safeInt(provider.getPenaltyCount()) * 15.0;

        return Math.max(0.0, Math.min(100.0, ratingComponent + reviewComponent + serviceComponent + verifiedComponent - penaltyComponent));
    }

    private String trustBadge(User provider) {
        if (getEffectiveAccountStatus(provider) == AccountStatus.COMPTE_GELE_TEMPORAIRE) {
            return "Compte gelé temporairement";
        }

        if (getEffectiveAccountStatus(provider) == AccountStatus.COMPTE_SUSPENDU_TEMPORAIRE) {
            return "Compte suspendu temporairement";
        }

        if (safeInt(provider.getRatingCount()) == 0) {
            return "Nouveau prestataire";
        }

        if (isFullyVerifiedProfile(provider)) {
            return "Profil vérifié complet";
        }

        if (isVerifiedProfile(provider)) {
            return "Profil vérifié";
        }

        return null;
    }

    private int statusPriority(UserStatus status) {
        if (status == null) {
            return 5;
        }

        return switch (status) {
            case DISPONIBLE -> 0;
            case EN_ATTENTE -> 1;
            case HORS_LIGNE -> 2;
            case OCCUPE -> 3;
            case EN_COURS_PRESTATION -> 4;
        };
    }

    public boolean isVerifiedProfile(User user) {
        return user != null && Boolean.TRUE.equals(user.getEmailVerified());
    }

    public boolean isFullyVerifiedProfile(User user) {
        return user != null
                && Boolean.TRUE.equals(user.getEmailVerified())
                && Boolean.TRUE.equals(user.getPhoneVerified());
    }

    private int safeInt(Integer value) {
        return value != null ? value : 0;
    }

    private double safeDouble(Double value) {
        return value != null ? value : 0.0;
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }

    private String normalize(String value) {
        if (value == null) {
            return "";
        }

        return value.toLowerCase(Locale.ROOT).trim();
    }
}

