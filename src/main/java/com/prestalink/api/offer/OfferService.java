package com.prestalink.api.offer;

import com.prestalink.api.category.CategoryRepository;
import com.prestalink.api.category.ServiceCategory;
import com.prestalink.api.favorite.FavoritePublicationRepository;
import com.prestalink.api.favorite.FavoritePublicationType;
import com.prestalink.api.notification.NotificationService;
import com.prestalink.api.notification.NotificationType;
import com.prestalink.api.photo.PublicationPhoto;
import com.prestalink.api.photo.PublicationPhotoRepository;
import com.prestalink.api.provider.ProviderTrustService;
import com.prestalink.api.publication.PublicationStatus;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import com.prestalink.api.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import com.prestalink.api.user.UserResponse;
import com.prestalink.api.websocket.OfferEvent;
import com.prestalink.api.websocket.FeedEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import com.prestalink.api.websocket.DashboardEvent;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class OfferService {
    private static final int MAX_PUBLICATION_PHOTOS = 3;

    private final OfferRepository offerRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ProviderTrustService providerTrustService;
    private final FavoritePublicationRepository favoritePublicationRepository;
    private final NotificationService notificationService;
    private final PublicationPhotoRepository publicationPhotoRepository;

    @Value("${prestalink.publications.expiration-days:30}")
    private long publicationExpirationDays;

    public ServiceOffer createOffer(Long providerId, Long categoryId, Long currentUserId, ServiceOffer offer) {
        validateAuthenticatedPublicationUser(providerId, currentUserId);

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Prestataire introuvable"));

        ServiceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));

        offer.setProvider(provider);
        offer.setCategory(category);
        offer.setActive(true);
        offer.setStatus(PublicationStatus.AVAILABLE);
        applyPublicationLocation(offer);
        offer.setPhotoUrls(normalizePhotoUrls(offer.getPhotoUrls()));

        ServiceOffer savedOffer = offerRepository.save(offer);
        notificationService.notifyUsersByRole(
                UserRole.CLIENT,
                NotificationType.NEW_OFFER,
                notificationService.messageFor(NotificationType.NEW_OFFER),
                savedOffer.getId(),
                provider.getId()
        );

        messagingTemplate.convertAndSend(
                "/topic/offers",
                OfferEvent.builder()
                        .type("OFFER_CREATED")
                        .offerId(savedOffer.getId())
                        .providerId(provider.getId())
                        .message("Nouvelle offre créée")
                        .build()
        );
        messagingTemplate.convertAndSend(
                "/topic/dashboard",
                DashboardEvent.builder()
                        .type("DASHBOARD_UPDATED")
                        .message("Les statistiques du dashboard doivent être mises à jour")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/feed",
                FeedEvent.builder()
                        .type("OFFERS_FEED_UPDATED")
                        .message("Le fil des offres doit être mis à jour")
                        .build()
        );
        messagingTemplate.convertAndSend(
                "/topic/dashboard",
                DashboardEvent.builder()
                        .type("DASHBOARD_UPDATED")
                        .message("Les statistiques du dashboard doivent être mises à jour")
                        .build()
        );

        return savedOffer;
    }

    public List<ServiceOffer> getAllOffers() {
        return offerRepository.findAll()
                .stream()
                .map(this::withPublicationPhotos)
                .toList();
    }

    public List<ServiceOffer> getActiveOffers() {
        return offerRepository.findByActiveTrue()
                .stream()
                .map(this::withPublicationPhotos)
                .toList();
    }

    private UserResponse toUserResponse(User user) {
        return providerTrustService.toUserResponse(user);
    }

    public OfferResponse toOfferResponse(ServiceOffer offer) {
        return OfferResponse.builder()
                .id(offer.getId())
                .title(offer.getTitle())
                .description(offer.getDescription())
                .price(offer.getPrice())
                .location(offer.getLocation())
                .locationLabel(offer.getLocationLabel())
                .latitude(offer.getLatitude())
                .longitude(offer.getLongitude())
                .active(offer.getActive())
                .status(effectiveStatus(offer))
                .createdAt(offer.getCreatedAt())
                .provider(toUserResponse(offer.getProvider()))
                .category(offer.getCategory())
                .photoUrls(publicationPhotoUrls(offer))
                .build();
    }
    public List<OfferResponse> getOffersFeed() {
        return getOffersFeed(null);
    }

    public List<OfferResponse> getOffersFeed(String location) {
        return offerRepository.findByActiveTrue()
                .stream()
                .filter(offer -> providerTrustService.isProviderSelectable(offer.getProvider()))
                .sorted(offerComparator(location))
                .map(this::toOfferResponse)
                .toList();
    }

    private Comparator<ServiceOffer> offerComparator(String location) {
        return Comparator
                .comparing(this::statusPriority)
                .thenComparing((ServiceOffer offer) -> offerLocationPriority(offer, location))
                .thenComparing((o1, o2) -> providerTrustService
                        .providerComparator(location)
                        .compare(o1.getProvider(), o2.getProvider()));
    }

    private int offerLocationPriority(ServiceOffer offer, String location) {
        if (location == null || location.trim().isEmpty()) {
            return 2;
        }

        String normalizedLocation = normalize(location);
        String offerLocation = normalize(offer.getLocation());

        if (!offerLocation.isBlank() && offerLocation.contains(normalizedLocation)) {
            return 0;
        }

        return providerTrustService.locationPriority(offer.getProvider(), location);
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }

    public ServiceOffer getOfferById(Long id) {
        return withPublicationPhotos(offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre introuvable")));
    }

    public void registerOfferView(Long id, Long currentUserId) {
        ServiceOffer offer = getOfferById(id);
        notificationService.notifyPublicationViewed(
                offer.getProvider().getId(),
                currentUserId,
                NotificationType.OFFER_VIEWED,
                id
        );
    }

    public ServiceOffer updateOffer(
            Long id,
            Long providerId,
            Long categoryId,
            Long currentUserId,
            ServiceOffer updatedOffer
    ) {
        validateAuthenticatedPublicationUser(providerId, currentUserId);

        ServiceOffer existingOffer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));

        if (!existingOffer.getProvider().getId().equals(providerId)) {
            throw new RuntimeException("Vous ne pouvez modifier que vos propres offres");
        }

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Prestataire introuvable"));

        ServiceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));

        existingOffer.setTitle(updatedOffer.getTitle());
        existingOffer.setDescription(updatedOffer.getDescription());
        existingOffer.setPrice(updatedOffer.getPrice());
        existingOffer.setLocation(updatedOffer.getLocation());
        existingOffer.setLocationLabel(updatedOffer.getLocationLabel());
        existingOffer.setLatitude(updatedOffer.getLatitude());
        existingOffer.setLongitude(updatedOffer.getLongitude());
        applyPublicationLocation(existingOffer);
        existingOffer.setActive(updatedOffer.getActive());
        existingOffer.setPhotoUrls(normalizePhotoUrls(updatedOffer.getPhotoUrls()));
        if (updatedOffer.getStatus() != null) {
            existingOffer.setStatus(updatedOffer.getStatus());
        }
        existingOffer.setProvider(provider);
        existingOffer.setCategory(category);

        return offerRepository.save(existingOffer);
    }

    public OfferResponse updateOfferStatus(Long id, Long currentUserId, PublicationStatus status) {
        validateAuthenticatedPublicationUser(currentUserId, currentUserId);

        ServiceOffer offer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));

        if (!offer.getProvider().getId().equals(currentUserId)) {
            throw new RuntimeException("Vous ne pouvez modifier que vos propres offres");
        }

        PublicationStatus currentStatus = effectiveStatus(offer);
        offer.setStatus(validateStatusTransition(currentStatus, status));
        offer.setActive(offer.getStatus() != PublicationStatus.SUSPENDED);

        ServiceOffer savedOffer = offerRepository.save(offer);
        publishOfferUpdated(savedOffer);

        return toOfferResponse(savedOffer);
    }

    @Transactional
    public void deleteOffer(Long id, Long currentUserId) {
        validateAuthenticatedPublicationUser(currentUserId, currentUserId);

        ServiceOffer existingOffer = offerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));

        if (!existingOffer.getProvider().getId().equals(currentUserId)) {
            throw new RuntimeException("Vous ne pouvez supprimer que vos propres offres");
        }

        offerRepository.delete(existingOffer);
        favoritePublicationRepository.deleteByPublicationTypeAndPublicationId(FavoritePublicationType.OFFER, id);

        messagingTemplate.convertAndSend(
                "/topic/offers",
                OfferEvent.builder()
                        .type("OFFER_DELETED")
                        .offerId(id)
                        .providerId(existingOffer.getProvider().getId())
                        .message("Offre supprimée")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/feed",
                FeedEvent.builder()
                        .type("OFFERS_FEED_UPDATED")
                        .message("Le fil des offres doit être mis à jour")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/dashboard",
                DashboardEvent.builder()
                        .type("DASHBOARD_UPDATED")
                        .message("Les statistiques du dashboard doivent être mises à jour")
                        .build()
        );
    }

    private void validateAuthenticatedPublicationUser(Long ownerId, Long currentUserId) {
        if (currentUserId == null || !currentUserId.equals(ownerId)) {
            throw new RuntimeException("Vous devez vous connecter pour publier une offre ou une demande.");
        }
    }

    private void validatePhotoLimit(List<String> photoUrls) {
        if (photoUrls != null && photoUrls.size() > MAX_PUBLICATION_PHOTOS) {
            throw new RuntimeException("Maximum 3 photos par publication.");
        }
    }

    private List<String> normalizePhotoUrls(List<String> photoUrls) {
        validatePhotoLimit(photoUrls);
        if (photoUrls == null) {
            return new ArrayList<>();
        }

        return photoUrls.stream()
                .filter(url -> url != null && !url.isBlank())
                .toList();
    }

    private ServiceOffer withPublicationPhotos(ServiceOffer offer) {
        offer.setPhotoUrls(publicationPhotoUrls(offer));
        return offer;
    }

    private List<String> publicationPhotoUrls(ServiceOffer offer) {
        List<String> urls = publicationPhotoRepository
                .findByPublicationTypeAndPublicationId("OFFER", offer.getId())
                .stream()
                .map(PublicationPhoto::getFileUrl)
                .filter(url -> url != null && !url.isBlank())
                .limit(MAX_PUBLICATION_PHOTOS)
                .toList();

        return urls.isEmpty() ? normalizePhotoUrls(offer.getPhotoUrls()) : urls;
    }

    private void applyPublicationLocation(ServiceOffer offer) {
        if (offer.getLocationLabel() == null || offer.getLocationLabel().isBlank()) {
            offer.setLocationLabel(offer.getLocation());
        }
    }

    private PublicationStatus effectiveStatus(ServiceOffer offer) {
        if (offer.getStatus() == null) {
            return PublicationStatus.AVAILABLE;
        }

        if (offer.getStatus() == PublicationStatus.AVAILABLE
                && offer.getCreatedAt() != null
                && publicationExpirationDays > 0
                && offer.getCreatedAt().isBefore(LocalDateTime.now().minusDays(publicationExpirationDays))) {
            offer.setStatus(PublicationStatus.EXPIRED);
            offerRepository.save(offer);
            notificationService.notifyPublicationExpired(offer.getProvider().getId(), offer.getId());
            return PublicationStatus.EXPIRED;
        }

        return offer.getStatus();
    }

    private int statusPriority(ServiceOffer offer) {
        return switch (effectiveStatus(offer)) {
            case AVAILABLE -> 0;
            case IN_PROGRESS -> 1;
            case SUSPENDED -> 2;
            case COMPLETED -> 3;
            case EXPIRED -> 4;
            default -> 5;
        };
    }

    private PublicationStatus validateStatusTransition(PublicationStatus current, PublicationStatus next) {
        if (next == null) {
            throw new RuntimeException("Statut de publication invalide");
        }

        if (next == PublicationStatus.EXPIRED) {
            throw new RuntimeException("Le statut expiré est réservé à l'expiration automatique");
        }

        if (current == PublicationStatus.COMPLETED && next != PublicationStatus.COMPLETED) {
            throw new RuntimeException("Une publication terminée ne peut pas être réactivée");
        }

        if ((current == PublicationStatus.SUSPENDED || current == PublicationStatus.EXPIRED)
                && next != PublicationStatus.AVAILABLE) {
            throw new RuntimeException("Cette publication doit être réactivée avant un autre changement");
        }

        return next;
    }

    private void publishOfferUpdated(ServiceOffer offer) {
        messagingTemplate.convertAndSend(
                "/topic/offers",
                OfferEvent.builder()
                        .type("OFFER_UPDATED")
                        .offerId(offer.getId())
                        .providerId(offer.getProvider().getId())
                        .message("Offre mise à jour")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/feed",
                FeedEvent.builder()
                        .type("OFFERS_FEED_UPDATED")
                        .message("Le fil des offres doit être mis à jour")
                        .build()
        );
    }

}

