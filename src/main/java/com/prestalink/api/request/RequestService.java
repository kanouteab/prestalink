package com.prestalink.api.request;

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
import com.prestalink.api.user.UserResponse;
import com.prestalink.api.websocket.RequestEvent;
import com.prestalink.api.websocket.FeedEvent;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import java.time.LocalDateTime;
import java.util.List;
import com.prestalink.api.websocket.DashboardEvent;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class RequestService {
    private static final int MAX_PUBLICATION_PHOTOS = 3;

    private final SimpMessagingTemplate messagingTemplate;
    private final RequestRepository requestRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ProviderTrustService providerTrustService;
    private final FavoritePublicationRepository favoritePublicationRepository;
    private final NotificationService notificationService;
    private final PublicationPhotoRepository publicationPhotoRepository;

    @Value("${prestalink.publications.expiration-days:30}")
    private long publicationExpirationDays;

    public ServiceRequest createRequest(Long clientId, Long categoryId, Long currentUserId, ServiceRequest request) {
        validateAuthenticatedPublicationUser(clientId, currentUserId);

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client introuvable"));

        ServiceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));

        request.setClient(client);
        request.setCategory(category);
        request.setStatus(PublicationStatus.AVAILABLE);
        applyPublicationLocation(request);
        request.setPhotoUrls(normalizePhotoUrls(request.getPhotoUrls()));

        ServiceRequest savedRequest = requestRepository.save(request);
        notificationService.notifyUsersByRole(
                UserRole.PRESTATAIRE,
                NotificationType.NEW_REQUEST,
                notificationService.messageFor(NotificationType.NEW_REQUEST),
                savedRequest.getId(),
                client.getId()
        );

        messagingTemplate.convertAndSend(
                "/topic/requests",
                RequestEvent.builder()
                        .type("REQUEST_CREATED")
                        .requestId(savedRequest.getId())
                        .clientId(client.getId())
                        .message("Nouvelle demande créée")
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
                        .type("REQUESTS_FEED_UPDATED")
                        .message("Le fil des demandes doit être mis à jour")
                        .build()
        );
        messagingTemplate.convertAndSend(
                "/topic/dashboard",
                DashboardEvent.builder()
                        .type("DASHBOARD_UPDATED")
                        .message("Les statistiques du dashboard doivent être mises à jour")
                        .build()
        );

        return savedRequest;
    }
    public RequestResponse cancelRequest(Long requestId) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        if (effectiveStatus(request) == PublicationStatus.IN_PROGRESS) {
            throw new RuntimeException("Une demande en cours ne peut pas être annulée directement");
        }

        if (effectiveStatus(request) == PublicationStatus.COMPLETED) {
            throw new RuntimeException("Une demande terminée ne peut pas être annulée");
        }

        if (effectiveStatus(request) == PublicationStatus.SUSPENDED) {
            throw new RuntimeException("Cette demande est déjà annulée");
        }

        request.setStatus(PublicationStatus.SUSPENDED);

        ServiceRequest savedRequest = requestRepository.save(request);

        messagingTemplate.convertAndSend(
                "/topic/requests",
                RequestEvent.builder()
                        .type("REQUEST_CANCELLED")
                        .requestId(savedRequest.getId())
                        .clientId(savedRequest.getClient().getId())
                        .message("Demande annulée")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/feed",
                FeedEvent.builder()
                        .type("REQUESTS_FEED_UPDATED")
                        .message("Le fil des demandes doit être mis à jour")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/dashboard",
                DashboardEvent.builder()
                        .type("DASHBOARD_UPDATED")
                        .message("Les statistiques du dashboard doivent être mises à jour")
                        .build()
        );

        return toRequestResponse(savedRequest);
    }

    private UserResponse toUserResponse(User user) {
        return providerTrustService.toUserResponse(user);
    }

    public RequestResponse toRequestResponse(ServiceRequest request) {
        return RequestResponse.builder()
                .id(request.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .budget(request.getBudget())
                .location(request.getLocation())
                .locationLabel(request.getLocationLabel())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status(effectiveStatus(request))
                .createdAt(request.getCreatedAt())
                .client(toUserResponse(request.getClient()))
                .category(request.getCategory())
                .photoUrls(publicationPhotoUrls(request))
                .build();
    }
    public List<RequestResponse> getAllRequests() {
        return getAllRequests(null, null);
    }

    public List<RequestResponse> getAllRequests(Long providerId, String location) {
        String targetLocation = location;

        if (providerId != null) {
            User provider = userRepository.findById(providerId)
                    .orElseThrow(() -> new RuntimeException("Prestataire introuvable"));
            targetLocation = provider.getStreetAddress() + " " + provider.getPostalCode() + " " + provider.getCountry();
        }

        return requestRepository.findAll()
                .stream()
                .sorted(requestComparator(targetLocation))
                .map(this::toRequestResponse)
                .toList();
    }

    private Comparator<ServiceRequest> requestComparator(String location) {
        return Comparator
                .comparing(this::statusPriority)
                .thenComparing((ServiceRequest request) -> requestLocationPriority(request, location))
                .thenComparing(ServiceRequest::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()));
    }

    private int requestLocationPriority(ServiceRequest request, String location) {
        if (location == null || location.trim().isEmpty()) {
            return 2;
        }

        String normalizedLocation = normalize(location);
        String requestLocation = normalize(request.getLocation());
        String clientLocality = normalize(request.getClient().getStreetAddress() + " " + request.getClient().getPostalCode() + " " + request.getClient().getCountry());

        if (!requestLocation.isBlank() && requestLocation.contains(normalizedLocation)) {
            return 0;
        }

        if (!clientLocality.isBlank() && clientLocality.contains(normalizedLocation)) {
            return 0;
        }

        if (!requestLocation.isBlank() && normalizedLocation.contains(requestLocation)) {
            return 1;
        }

        if (request.getClient().getCountry() != null
                && !request.getClient().getCountry().isBlank()
                && normalizedLocation.contains(normalize(request.getClient().getCountry()))) {
            return 1;
        }

        return 2;
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT).trim();
    }

    public List<RequestResponse> getPendingRequests() {
        return requestRepository.findByStatus(PublicationStatus.AVAILABLE)
                .stream()
                .map(this::toRequestResponse)
                .toList();
    }

    public ServiceRequest getRequestById(Long id) {
        return withPublicationPhotos(requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable")));
    }

    public void registerRequestView(Long id, Long currentUserId) {
        ServiceRequest request = getRequestById(id);
        notificationService.notifyPublicationViewed(
                request.getClient().getId(),
                currentUserId,
                NotificationType.REQUEST_VIEWED,
                id
        );
    }

    public ServiceRequest updateRequest(
            Long id,
            Long clientId,
            Long categoryId,
            Long currentUserId,
            ServiceRequest updatedRequest
    ) {
        validateAuthenticatedPublicationUser(clientId, currentUserId);

        ServiceRequest existingRequest = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        if (!existingRequest.getClient().getId().equals(clientId)) {
            throw new RuntimeException("Vous ne pouvez modifier que vos propres demandes");
        }

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client introuvable"));

        ServiceCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Catégorie introuvable"));

        existingRequest.setTitle(updatedRequest.getTitle());
        existingRequest.setDescription(updatedRequest.getDescription());
        existingRequest.setBudget(updatedRequest.getBudget());
        existingRequest.setLocation(updatedRequest.getLocation());
        existingRequest.setLocationLabel(updatedRequest.getLocationLabel());
        existingRequest.setLatitude(updatedRequest.getLatitude());
        existingRequest.setLongitude(updatedRequest.getLongitude());
        applyPublicationLocation(existingRequest);
        existingRequest.setPhotoUrls(normalizePhotoUrls(updatedRequest.getPhotoUrls()));
        if (updatedRequest.getStatus() != null) {
            existingRequest.setStatus(updatedRequest.getStatus());
        }
        existingRequest.setClient(client);
        existingRequest.setCategory(category);

        return requestRepository.save(existingRequest);
    }

    public RequestResponse updateRequestStatus(Long id, Long currentUserId, PublicationStatus status) {
        validateAuthenticatedPublicationUser(currentUserId, currentUserId);

        ServiceRequest request = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        if (!request.getClient().getId().equals(currentUserId)) {
            throw new RuntimeException("Vous ne pouvez modifier que vos propres demandes");
        }

        PublicationStatus currentStatus = effectiveStatus(request);
        request.setStatus(validateStatusTransition(currentStatus, status));

        ServiceRequest savedRequest = requestRepository.save(request);
        publishRequestUpdated(savedRequest);

        return toRequestResponse(savedRequest);
    }

    @Transactional
    public void deleteRequest(Long id, Long currentUserId) {
        validateAuthenticatedPublicationUser(currentUserId, currentUserId);

        ServiceRequest existingRequest = requestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        if (!existingRequest.getClient().getId().equals(currentUserId)) {
            throw new RuntimeException("Vous ne pouvez supprimer que vos propres demandes");
        }

        requestRepository.delete(existingRequest);
        favoritePublicationRepository.deleteByPublicationTypeAndPublicationId(FavoritePublicationType.REQUEST, id);

        messagingTemplate.convertAndSend(
                "/topic/requests",
                RequestEvent.builder()
                        .type("REQUEST_DELETED")
                        .requestId(id)
                        .clientId(existingRequest.getClient().getId())
                        .message("Demande supprimée")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/feed",
                FeedEvent.builder()
                        .type("REQUESTS_FEED_UPDATED")
                        .message("Le fil des demandes doit être mis à jour")
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

    private ServiceRequest withPublicationPhotos(ServiceRequest request) {
        request.setPhotoUrls(publicationPhotoUrls(request));
        return request;
    }

    private List<String> publicationPhotoUrls(ServiceRequest request) {
        List<String> urls = publicationPhotoRepository
                .findByPublicationTypeAndPublicationId("REQUEST", request.getId())
                .stream()
                .map(PublicationPhoto::getFileUrl)
                .filter(url -> url != null && !url.isBlank())
                .limit(MAX_PUBLICATION_PHOTOS)
                .toList();

        return urls.isEmpty() ? normalizePhotoUrls(request.getPhotoUrls()) : urls;
    }

    private void applyPublicationLocation(ServiceRequest request) {
        if (request.getLocationLabel() == null || request.getLocationLabel().isBlank()) {
            request.setLocationLabel(request.getLocation());
        }
    }

    private PublicationStatus effectiveStatus(ServiceRequest request) {
        if (request.getStatus() == null) {
            return PublicationStatus.AVAILABLE;
        }

        PublicationStatus status = switch (request.getStatus()) {
            case EN_ATTENTE -> PublicationStatus.AVAILABLE;
            case EN_COURS -> PublicationStatus.IN_PROGRESS;
            case TERMINEE -> PublicationStatus.COMPLETED;
            case ANNULEE -> PublicationStatus.SUSPENDED;
            default -> request.getStatus();
        };

        if (status == PublicationStatus.AVAILABLE
                && request.getCreatedAt() != null
                && publicationExpirationDays > 0
                && request.getCreatedAt().isBefore(LocalDateTime.now().minusDays(publicationExpirationDays))) {
            request.setStatus(PublicationStatus.EXPIRED);
            requestRepository.save(request);
            notificationService.notifyPublicationExpired(request.getClient().getId(), request.getId());
            return PublicationStatus.EXPIRED;
        }

        return status;
    }

    private int statusPriority(ServiceRequest request) {
        return switch (effectiveStatus(request)) {
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

    private void publishRequestUpdated(ServiceRequest request) {
        messagingTemplate.convertAndSend(
                "/topic/requests",
                RequestEvent.builder()
                        .type("REQUEST_UPDATED")
                        .requestId(request.getId())
                        .clientId(request.getClient().getId())
                        .message("Demande mise à jour")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/feed",
                FeedEvent.builder()
                        .type("REQUESTS_FEED_UPDATED")
                        .message("Le fil des demandes doit être mis à jour")
                        .build()
        );
    }

}

