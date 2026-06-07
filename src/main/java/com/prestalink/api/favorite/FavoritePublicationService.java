package com.prestalink.api.favorite;

import com.prestalink.api.offer.OfferRepository;
import com.prestalink.api.offer.OfferResponse;
import com.prestalink.api.offer.ServiceOffer;
import com.prestalink.api.provider.ProviderTrustService;
import com.prestalink.api.request.RequestRepository;
import com.prestalink.api.request.RequestResponse;
import com.prestalink.api.request.ServiceRequest;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoritePublicationService {

    private final FavoritePublicationRepository favoriteRepository;
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;
    private final RequestRepository requestRepository;
    private final ProviderTrustService providerTrustService;

    @Transactional
    public FavoritePublicationResponse addFavorite(Long currentUserId, FavoritePublicationRequest request) {
        User user = getCurrentUser(currentUserId);
        validateRequest(request);
        validatePublicationExists(request.getPublicationType(), request.getPublicationId());

        return favoriteRepository
                .findByUserAndPublicationTypeAndPublicationId(
                        user,
                        request.getPublicationType(),
                        request.getPublicationId()
                )
                .map(this::toResponse)
                .orElseGet(() -> toResponse(favoriteRepository.save(
                        FavoritePublication.builder()
                                .user(user)
                                .publicationType(request.getPublicationType())
                                .publicationId(request.getPublicationId())
                                .build()
                )));
    }

    @Transactional
    public void removeFavorite(Long currentUserId, FavoritePublicationType publicationType, Long publicationId) {
        User user = getCurrentUser(currentUserId);
        validatePublicationIdentity(publicationType, publicationId);

        favoriteRepository
                .findByUserAndPublicationTypeAndPublicationId(user, publicationType, publicationId)
                .ifPresent(favoriteRepository::delete);
    }

    public List<FavoritePublicationResponse> getMyFavorites(Long currentUserId) {
        User user = getCurrentUser(currentUserId);

        return favoriteRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public FavoriteStatusResponse getStatus(
            Long currentUserId,
            FavoritePublicationType publicationType,
            Long publicationId
    ) {
        User user = getCurrentUser(currentUserId);
        validatePublicationIdentity(publicationType, publicationId);

        return FavoriteStatusResponse.builder()
                .publicationType(publicationType)
                .publicationId(publicationId)
                .favorite(favoriteRepository.existsByUserAndPublicationTypeAndPublicationId(
                        user,
                        publicationType,
                        publicationId
                ))
                .build();
    }

    @Transactional
    public void removeDeletedPublication(FavoritePublicationType publicationType, Long publicationId) {
        favoriteRepository.deleteByPublicationTypeAndPublicationId(publicationType, publicationId);
    }

    private FavoritePublicationResponse toResponse(FavoritePublication favorite) {
        FavoritePublicationResponse.FavoritePublicationResponseBuilder builder =
                FavoritePublicationResponse.builder()
                        .id(favorite.getId())
                        .publicationType(favorite.getPublicationType())
                        .publicationId(favorite.getPublicationId())
                        .createdAt(favorite.getCreatedAt());

        if (favorite.getPublicationType() == FavoritePublicationType.OFFER) {
            return offerRepository.findById(favorite.getPublicationId())
                    .map(offer -> builder
                            .available(true)
                            .offer(toOfferResponse(offer))
                            .build())
                    .orElseGet(() -> unavailable(builder));
        }

        return requestRepository.findById(favorite.getPublicationId())
                .map(request -> builder
                        .available(true)
                        .request(toRequestResponse(request))
                        .build())
                .orElseGet(() -> unavailable(builder));
    }

    private OfferResponse toOfferResponse(ServiceOffer offer) {
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
                .createdAt(offer.getCreatedAt())
                .provider(providerTrustService.toUserResponse(offer.getProvider()))
                .category(offer.getCategory())
                .photoUrls(offer.getPhotoUrls())
                .build();
    }

    private RequestResponse toRequestResponse(ServiceRequest request) {
        return RequestResponse.builder()
                .id(request.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .budget(request.getBudget())
                .location(request.getLocation())
                .locationLabel(request.getLocationLabel())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(request.getStatus())
                .createdAt(request.getCreatedAt())
                .client(providerTrustService.toUserResponse(request.getClient()))
                .category(request.getCategory())
                .photoUrls(request.getPhotoUrls())
                .build();
    }

    private FavoritePublicationResponse unavailable(FavoritePublicationResponse.FavoritePublicationResponseBuilder builder) {
        return builder
                .available(false)
                .unavailableMessage("Cette publication n’est plus disponible.")
                .build();
    }

    private User getCurrentUser(Long currentUserId) {
        if (currentUserId == null) {
            throw new RuntimeException("Vous devez vous connecter pour ajouter cette publication aux favoris.");
        }

        return userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Vous devez vous connecter pour ajouter cette publication aux favoris."));
    }

    private void validateRequest(FavoritePublicationRequest request) {
        if (request == null) {
            throw new RuntimeException("Publication invalide");
        }

        validatePublicationIdentity(request.getPublicationType(), request.getPublicationId());
    }

    private void validatePublicationIdentity(FavoritePublicationType publicationType, Long publicationId) {
        if (publicationType == null || publicationId == null || publicationId <= 0) {
            throw new RuntimeException("Publication invalide");
        }
    }

    private void validatePublicationExists(FavoritePublicationType publicationType, Long publicationId) {
        boolean exists = publicationType == FavoritePublicationType.OFFER
                ? offerRepository.existsById(publicationId)
                : requestRepository.existsById(publicationId);

        if (!exists) {
            throw new RuntimeException("Cette publication n’est plus disponible.");
        }
    }
}

