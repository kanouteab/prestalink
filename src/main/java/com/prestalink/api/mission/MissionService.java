package com.prestalink.api.mission;

import com.prestalink.api.notification.NotificationService;
import com.prestalink.api.provider.ProviderTrustService;
import com.prestalink.api.request.RequestRepository;
import com.prestalink.api.request.RequestResponse;
import com.prestalink.api.publication.PublicationStatus;
import com.prestalink.api.request.ServiceRequest;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import com.prestalink.api.user.UserResponse;
import com.prestalink.api.user.UserStatus;
import com.prestalink.api.websocket.DashboardEvent;
import com.prestalink.api.websocket.FeedEvent;
import com.prestalink.api.websocket.MissionEvent;
import com.prestalink.api.websocket.UserNotificationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class MissionService {

    private final MissionRepository missionRepository;
    private final UserRepository userRepository;
    private final RequestRepository requestRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;
    private final ProviderTrustService providerTrustService;

    public MissionResponse createMission(Long clientId, Long providerId, Long requestId) {

        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new RuntimeException("Client introuvable"));

        User provider = userRepository.findById(providerId)
                .orElseThrow(() -> new RuntimeException("Prestataire introuvable"));

        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        if (!request.getClient().getId().equals(client.getId())) {
            throw new RuntimeException("Cette demande n'appartient pas à ce client");
        }

        if (client.getId().equals(provider.getId())) {
            throw new RuntimeException("Un utilisateur ne peut pas accepter sa propre demande");
        }

        if (client.getStatus() != UserStatus.DISPONIBLE) {
            throw new RuntimeException("Ce client n'est pas disponible");
        }

        if (provider.getStatus() != UserStatus.DISPONIBLE) {
            throw new RuntimeException("Ce prestataire n'est pas disponible");
        }

        if (!providerTrustService.isProviderSelectable(provider)) {
            throw new RuntimeException(providerTrustService.accountStatusLabel(providerTrustService.getEffectiveAccountStatus(provider)));
        }

        if (request.getStatus() != PublicationStatus.AVAILABLE
                && request.getStatus() != PublicationStatus.EN_ATTENTE) {
            throw new RuntimeException("Cette demande n'est plus disponible");
        }

        client.setStatus(UserStatus.OCCUPE);
        provider.setStatus(UserStatus.EN_COURS_PRESTATION);
        request.setStatus(PublicationStatus.IN_PROGRESS);

        userRepository.save(client);
        userRepository.save(provider);
        requestRepository.save(request);

        Mission mission = Mission.builder()
                .client(client)
                .provider(provider)
                .request(request)
                .status(MissionStatus.EN_COURS)
                .startedAt(LocalDateTime.now())
                .build();

        Mission savedMission = missionRepository.save(mission);
        providerTrustService.refreshProviderRating(savedMission.getProvider());

        notificationService.createNotification(
                client.getId(),
                "MISSION_CREATED_FOR_CLIENT",
                "Mission créée",
                "Votre demande a été prise en charge"
        );

        notificationService.createNotification(
                provider.getId(),
                "MISSION_CREATED_FOR_PROVIDER",
                "Nouvelle mission",
                "Vous avez une nouvelle prestation en cours"
        );

        messagingTemplate.convertAndSend(
                "/topic/users/" + client.getId(),
                UserNotificationEvent.builder()
                        .type("MISSION_CREATED_FOR_CLIENT")
                        .userId(client.getId())
                        .title("Mission créée")
                        .message("Votre demande a été prise en charge")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/users/" + provider.getId(),
                UserNotificationEvent.builder()
                        .type("MISSION_CREATED_FOR_PROVIDER")
                        .userId(provider.getId())
                        .title("Nouvelle mission")
                        .message("Vous avez une nouvelle prestation en cours")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/missions",
                MissionEvent.builder()
                        .type("MISSION_CREATED")
                        .missionId(savedMission.getId())
                        .clientId(client.getId())
                        .providerId(provider.getId())
                        .message("Nouvelle mission créée")
                        .build()
        );

        sendProvidersFeedUpdated();
        sendDashboardUpdated();

        return toMissionResponse(savedMission);
    }

    public MissionResponse finishMission(Long missionId) {

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission introuvable"));

        if (mission.getStatus() == MissionStatus.TERMINEE) {
            throw new RuntimeException("Cette mission est déjà terminée");
        }

        if (mission.getStatus() != MissionStatus.EN_COURS) {
            throw new RuntimeException("Cette mission ne peut pas être terminée");
        }

        mission.setStatus(MissionStatus.TERMINEE);
        mission.setFinishedAt(LocalDateTime.now());

        mission.getClient().setStatus(UserStatus.DISPONIBLE);
        mission.getProvider().setStatus(UserStatus.DISPONIBLE);
        mission.getRequest().setStatus(PublicationStatus.COMPLETED);

        userRepository.save(mission.getClient());
        userRepository.save(mission.getProvider());
        requestRepository.save(mission.getRequest());

        Mission savedMission = missionRepository.save(mission);
        providerTrustService.refreshProviderRating(savedMission.getProvider());

        notificationService.createNotification(
                savedMission.getClient().getId(),
                "MISSION_FINISHED_FOR_CLIENT",
                "Mission terminée",
                "Votre mission est terminée"
        );

        notificationService.createNotification(
                savedMission.getProvider().getId(),
                "MISSION_FINISHED_FOR_PROVIDER",
                "Mission terminée",
                "La prestation est terminée"
        );

        messagingTemplate.convertAndSend(
                "/topic/users/" + savedMission.getClient().getId(),
                UserNotificationEvent.builder()
                        .type("MISSION_FINISHED_FOR_CLIENT")
                        .userId(savedMission.getClient().getId())
                        .title("Mission terminée")
                        .message("Votre mission est terminée")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/users/" + savedMission.getProvider().getId(),
                UserNotificationEvent.builder()
                        .type("MISSION_FINISHED_FOR_PROVIDER")
                        .userId(savedMission.getProvider().getId())
                        .title("Mission terminée")
                        .message("La prestation est terminée")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/missions",
                MissionEvent.builder()
                        .type("MISSION_FINISHED")
                        .missionId(savedMission.getId())
                        .clientId(savedMission.getClient().getId())
                        .providerId(savedMission.getProvider().getId())
                        .message("Mission terminée")
                        .build()
        );

        sendProvidersFeedUpdated();
        sendDashboardUpdated();

        return toMissionResponse(savedMission);
    }

    public MissionResponse cancelMission(Long missionId) {

        Mission mission = missionRepository.findById(missionId)
                .orElseThrow(() -> new RuntimeException("Mission introuvable"));

        if (mission.getStatus() == MissionStatus.TERMINEE) {
            throw new RuntimeException("Une mission terminée ne peut pas être annulée");
        }

        if (mission.getStatus() == MissionStatus.ANNULEE) {
            throw new RuntimeException("Cette mission est déjà annulée");
        }

        mission.setStatus(MissionStatus.ANNULEE);
        mission.setFinishedAt(LocalDateTime.now());

        mission.getClient().setStatus(UserStatus.DISPONIBLE);
        mission.getProvider().setStatus(UserStatus.DISPONIBLE);
        mission.getRequest().setStatus(PublicationStatus.SUSPENDED);

        userRepository.save(mission.getClient());
        userRepository.save(mission.getProvider());
        requestRepository.save(mission.getRequest());

        Mission savedMission = missionRepository.save(mission);

        notificationService.createNotification(
                savedMission.getClient().getId(),
                "MISSION_CANCELLED_FOR_CLIENT",
                "Mission annulée",
                "Votre mission a été annulée"
        );

        notificationService.createNotification(
                savedMission.getProvider().getId(),
                "MISSION_CANCELLED_FOR_PROVIDER",
                "Mission annulée",
                "La mission a été annulée"
        );

        messagingTemplate.convertAndSend(
                "/topic/users/" + savedMission.getClient().getId(),
                UserNotificationEvent.builder()
                        .type("MISSION_CANCELLED_FOR_CLIENT")
                        .userId(savedMission.getClient().getId())
                        .title("Mission annulée")
                        .message("Votre mission a été annulée")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/users/" + savedMission.getProvider().getId(),
                UserNotificationEvent.builder()
                        .type("MISSION_CANCELLED_FOR_PROVIDER")
                        .userId(savedMission.getProvider().getId())
                        .title("Mission annulée")
                        .message("La mission a été annulée")
                        .build()
        );

        messagingTemplate.convertAndSend(
                "/topic/missions",
                MissionEvent.builder()
                        .type("MISSION_CANCELLED")
                        .missionId(savedMission.getId())
                        .clientId(savedMission.getClient().getId())
                        .providerId(savedMission.getProvider().getId())
                        .message("Mission annulée")
                        .build()
        );

        sendProvidersFeedUpdated();
        sendDashboardUpdated();

        return toMissionResponse(savedMission);
    }

    public List<MissionResponse> getAllMissions() {
        return missionRepository.findAll()
                .stream()
                .map(this::toMissionResponse)
                .toList();
    }

    public List<MissionResponse> getActiveMissions() {
        return missionRepository.findByStatus(MissionStatus.EN_COURS)
                .stream()
                .map(this::toMissionResponse)
                .toList();
    }

    private void sendProvidersFeedUpdated() {
        messagingTemplate.convertAndSend(
                "/topic/feed",
                FeedEvent.builder()
                        .type("PROVIDERS_FEED_UPDATED")
                        .message("Le fil des prestataires doit être mis à jour")
                        .build()
        );
    }

    private void sendDashboardUpdated() {
        messagingTemplate.convertAndSend(
                "/topic/dashboard",
                DashboardEvent.builder()
                        .type("DASHBOARD_UPDATED")
                        .message("Les statistiques du dashboard doivent être mises à jour")
                        .build()
        );
    }

    private UserResponse toUserResponse(User user) {
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
                .client(toUserResponse(request.getClient()))
                .category(request.getCategory())
                .photoUrls(request.getPhotoUrls())
                .build();
    }

    private MissionResponse toMissionResponse(Mission mission) {
        return MissionResponse.builder()
                .id(mission.getId())
                .status(mission.getStatus())
                .startedAt(mission.getStartedAt())
                .finishedAt(mission.getFinishedAt())
                .client(toUserResponse(mission.getClient()))
                .provider(toUserResponse(mission.getProvider()))
                .request(toRequestResponse(mission.getRequest()))
                .build();
    }
}

