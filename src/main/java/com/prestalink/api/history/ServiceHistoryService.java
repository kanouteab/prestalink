package com.prestalink.api.history;

import com.prestalink.api.mission.Mission;
import com.prestalink.api.mission.MissionRepository;
import com.prestalink.api.mission.MissionService;
import com.prestalink.api.mission.MissionStatus;
import com.prestalink.api.publication.PublicationStatus;
import com.prestalink.api.request.RequestRepository;
import com.prestalink.api.request.ServiceRequest;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ServiceHistoryService {

    private final MissionRepository missionRepository;
    private final MissionService missionService;
    private final RequestRepository requestRepository;
    private final UserRepository userRepository;

    public ServiceHistoryResponse getMyHistory(Long currentUserId) {
        if (currentUserId == null) {
            throw new RuntimeException("Vous devez vous connecter pour consulter votre historique.");
        }

        return getUserHistory(currentUserId);
    }

    public ServiceHistoryResponse getUserHistory(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        List<ServiceHistoryItemResponse> providedServices = missionRepository.findByProvider(user)
                .stream()
                .map(mission -> toProvidedHistoryItem(mission, user))
                .sorted(historyComparator())
                .toList();

        List<ServiceHistoryItemResponse> requestedServices = requestRepository.findByClient(user)
                .stream()
                .map(request -> toRequestedHistoryItem(request, user))
                .sorted(historyComparator())
                .toList();

        return ServiceHistoryResponse.builder()
                .providedServices(providedServices)
                .requestedServices(requestedServices)
                .build();
    }

    public ServiceHistoryItemResponse updateStatus(Long historyId, HistoryStatus status) {
        if (status == null) {
            throw new RuntimeException("Statut invalide");
        }

        Mission mission = missionRepository.findById(historyId)
                .orElseThrow(() -> new RuntimeException("Historique introuvable"));

        if (status == HistoryStatus.COMPLETED) {
            return toProvidedHistoryItemFromResponse(missionService.finishMission(historyId));
        }

        if (status == HistoryStatus.CANCELLED) {
            return toProvidedHistoryItemFromResponse(missionService.cancelMission(historyId));
        }

        mission.setStatus(MissionStatus.EN_COURS);
        return toProvidedHistoryItem(missionRepository.save(mission), mission.getProvider());
    }

    private ServiceHistoryItemResponse toProvidedHistoryItem(Mission mission, User currentUser) {
        ServiceRequest request = mission.getRequest();
        User client = mission.getClient();
        User provider = mission.getProvider();
        HistoryStatus status = fromMissionStatus(mission.getStatus());

        return ServiceHistoryItemResponse.builder()
                .id(mission.getId())
                .direction("PROVIDED")
                .title(request != null ? request.getTitle() : "Prestation")
                .description(request != null ? request.getDescription() : "")
                .status(status)
                .createdAt(mission.getStartedAt())
                .updatedAt(mission.getFinishedAt() != null ? mission.getFinishedAt() : mission.getStartedAt())
                .completedAt(status == HistoryStatus.COMPLETED ? mission.getFinishedAt() : null)
                .cancelledAt(status == HistoryStatus.CANCELLED ? mission.getFinishedAt() : null)
                .providerId(provider != null ? provider.getId() : null)
                .providerName(provider != null ? provider.getFullName() : "")
                .clientId(client != null ? client.getId() : null)
                .clientName(client != null ? client.getFullName() : "")
                .otherUserId(client != null ? client.getId() : null)
                .otherUserName(client != null ? client.getFullName() : "Client")
                .requestId(request != null ? request.getId() : null)
                .publicationType("REQUEST")
                .build();
    }

    private ServiceHistoryItemResponse toRequestedHistoryItem(ServiceRequest request, User currentUser) {
        Mission mission = missionRepository.findByRequest(request)
                .stream()
                .findFirst()
                .orElse(null);
        User provider = mission != null ? mission.getProvider() : null;
        HistoryStatus status = mission != null
                ? fromMissionStatus(mission.getStatus())
                : fromRequestStatus(request.getStatus());
        LocalDateTime statusDate = mission != null ? mission.getFinishedAt() : null;

        return ServiceHistoryItemResponse.builder()
                .id(mission != null ? mission.getId() : request.getId())
                .direction("REQUESTED")
                .title(request.getTitle())
                .description(request.getDescription())
                .status(status)
                .createdAt(request.getCreatedAt())
                .updatedAt(statusDate != null ? statusDate : request.getCreatedAt())
                .completedAt(status == HistoryStatus.COMPLETED ? statusDate : null)
                .cancelledAt(status == HistoryStatus.CANCELLED ? statusDate : null)
                .providerId(provider != null ? provider.getId() : null)
                .providerName(provider != null ? provider.getFullName() : "")
                .clientId(currentUser.getId())
                .clientName(currentUser.getFullName())
                .otherUserId(provider != null ? provider.getId() : null)
                .otherUserName(provider != null ? provider.getFullName() : "Prestataire non assigné")
                .requestId(request.getId())
                .publicationType("REQUEST")
                .build();
    }

    private ServiceHistoryItemResponse toProvidedHistoryItemFromResponse(
            com.prestalink.api.mission.MissionResponse mission
    ) {
        return ServiceHistoryItemResponse.builder()
                .id(mission.getId())
                .direction("PROVIDED")
                .title(mission.getRequest() != null ? mission.getRequest().getTitle() : "Prestation")
                .description(mission.getRequest() != null ? mission.getRequest().getDescription() : "")
                .status(fromMissionStatus(mission.getStatus()))
                .createdAt(mission.getStartedAt())
                .updatedAt(mission.getFinishedAt() != null ? mission.getFinishedAt() : mission.getStartedAt())
                .completedAt(mission.getStatus() == MissionStatus.TERMINEE ? mission.getFinishedAt() : null)
                .cancelledAt(mission.getStatus() == MissionStatus.ANNULEE ? mission.getFinishedAt() : null)
                .providerId(mission.getProvider() != null ? mission.getProvider().getId() : null)
                .providerName(mission.getProvider() != null ? mission.getProvider().getFullName() : "")
                .clientId(mission.getClient() != null ? mission.getClient().getId() : null)
                .clientName(mission.getClient() != null ? mission.getClient().getFullName() : "")
                .otherUserId(mission.getClient() != null ? mission.getClient().getId() : null)
                .otherUserName(mission.getClient() != null ? mission.getClient().getFullName() : "Client")
                .requestId(mission.getRequest() != null ? mission.getRequest().getId() : null)
                .publicationType("REQUEST")
                .build();
    }

    private HistoryStatus fromMissionStatus(MissionStatus status) {
        if (status == MissionStatus.TERMINEE) {
            return HistoryStatus.COMPLETED;
        }

        if (status == MissionStatus.ANNULEE) {
            return HistoryStatus.CANCELLED;
        }

        return HistoryStatus.PENDING;
    }

    private HistoryStatus fromRequestStatus(PublicationStatus status) {
        if (status == PublicationStatus.COMPLETED || status == PublicationStatus.TERMINEE) {
            return HistoryStatus.COMPLETED;
        }

        if (status == PublicationStatus.SUSPENDED || status == PublicationStatus.ANNULEE) {
            return HistoryStatus.CANCELLED;
        }

        return HistoryStatus.PENDING;
    }

    private Comparator<ServiceHistoryItemResponse> historyComparator() {
        return Comparator.comparing(
                ServiceHistoryItemResponse::getUpdatedAt,
                Comparator.nullsLast(Comparator.reverseOrder())
        );
    }
}

