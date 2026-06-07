package com.prestalink.api.notification;

import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import com.prestalink.api.user.UserRole;
import com.prestalink.api.websocket.UserNotificationEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public Notification createNotification(
            Long userId,
            String type,
            String title,
            String message
    ) {
        return createNotification(userId, type, title, message, null, null);
    }

    public Notification createNotification(
            Long userId,
            NotificationType type,
            String message,
            Long relatedPublicationId
    ) {
        return createNotification(userId, type.name(), message, message, relatedPublicationId, null);
    }

    public Notification createNotification(
            Long userId,
            String type,
            String title,
            String message,
            Long relatedPublicationId,
            Long actorUserId
    ) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        Notification notification = Notification.builder()
                .type(type)
                .title(title)
                .message(message)
                .priority(NotificationPriority.INFO)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .relatedPublicationId(relatedPublicationId)
                .actorUserId(actorUserId)
                .user(user)
                .build();

        Notification savedNotification = notificationRepository.save(notification);
        sendUserNotification(userId, type, title, message);

        return savedNotification;
    }

    public void notifyUsersByRole(UserRole role, NotificationType type, String message, Long relatedPublicationId, Long excludedUserId) {
        userRepository.findByRole(role)
                .stream()
                .filter(user -> excludedUserId == null || !user.getId().equals(excludedUserId))
                .forEach(user -> createNotification(user.getId(), type.name(), message, message, relatedPublicationId, excludedUserId));
    }

    public void notifyPublicationViewed(Long ownerId, Long viewerId, NotificationType type, Long relatedPublicationId) {
        if (ownerId == null || viewerId == null || ownerId.equals(viewerId)) {
            return;
        }

        User owner = getUser(ownerId);
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(10);
        boolean duplicate = notificationRepository
                .existsByUserAndTypeAndRelatedPublicationIdAndActorUserIdAndCreatedAtAfter(
                        owner,
                        type.name(),
                        relatedPublicationId,
                        viewerId,
                        cutoff
                );

        if (duplicate) {
            return;
        }

        createNotification(ownerId, type.name(), messageFor(type), messageFor(type), relatedPublicationId, viewerId);
    }

    public void notifyPublicationExpired(Long ownerId, Long publicationId) {
        createNotification(ownerId, NotificationType.PUBLICATION_EXPIRED, messageFor(NotificationType.PUBLICATION_EXPIRED), publicationId);
    }

    public String messageFor(NotificationType type) {
        return switch (type) {
            case NEW_REQUEST -> "Nouvelle demande reçue";
            case NEW_OFFER -> "Nouvelle offre publiée";
            case NEW_COMMENT -> "Nouveau commentaire reçu";
            case NEW_RATING -> "Nouvelle note reçue";
            case PUBLICATION_EXPIRED -> "Votre publication a expiré";
            case OFFER_VIEWED -> "Votre offre a été consultée";
            case REQUEST_VIEWED -> "Votre demande a été consultée";
        };
    }

    public List<NotificationResponse> getUserNotifications(Long userId) {
        User user = getUser(userId);

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toNotificationResponse)
                .toList();
    }

    public List<NotificationResponse> getCurrentUserNotifications(Long currentUserId) {
        return getUserNotifications(currentUserId);
    }

    public NotificationResponse markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));

        notification.setIsRead(true);

        Notification savedNotification = notificationRepository.save(notification);

        sendUserNotification(
                savedNotification.getUser().getId(),
                "NOTIFICATION_READ",
                "Notification lue",
                "Une notification a été marquée comme lue"
        );

        return toNotificationResponse(savedNotification);
    }

    public long getUnreadCount(Long userId) {
        User user = getUser(userId);
        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    public List<NotificationResponse> markAllAsRead(Long userId) {
        User user = getUser(userId);

        List<Notification> notifications =
                notificationRepository.findByUserOrderByCreatedAtDesc(user);

        notifications.forEach(notification -> notification.setIsRead(true));

        List<Notification> savedNotifications =
                notificationRepository.saveAll(notifications);

        sendUserNotification(
                userId,
                "ALL_NOTIFICATIONS_READ",
                "Notifications lues",
                "Toutes vos notifications ont été marquées comme lues"
        );

        return savedNotifications
                .stream()
                .map(this::toNotificationResponse)
                .toList();
    }

    public List<NotificationResponse> markCurrentUserAllAsRead(Long currentUserId) {
        return markAllAsRead(currentUserId);
    }

    public void deleteNotification(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification introuvable"));

        Long userId = notification.getUser().getId();

        notificationRepository.delete(notification);

        sendUserNotification(
                userId,
                "NOTIFICATION_DELETED",
                "Notification supprimée",
                "Une notification a été supprimée"
        );
    }

    public List<NotificationResponse> getUserNotificationsPaginated(
            Long userId,
            int page,
            int size
    ) {
        User user = getUser(userId);

        return notificationRepository
                .findByUserOrderByCreatedAtDesc(
                        user,
                        PageRequest.of(page, size)
                )
                .stream()
                .map(this::toNotificationResponse)
                .toList();
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    private void sendUserNotification(
            Long userId,
            String type,
            String title,
            String message
    ) {
        messagingTemplate.convertAndSend(
                "/topic/users/" + userId,
                UserNotificationEvent.builder()
                        .type(type)
                        .userId(userId)
                        .title(title)
                        .message(message)
                        .build()
        );
    }

    private NotificationResponse toNotificationResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .priority(notification.getPriority())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .userId(notification.getUser().getId())
                .relatedPublicationId(notification.getRelatedPublicationId())
                .actorUserId(notification.getActorUserId())
                .build();
    }
}

