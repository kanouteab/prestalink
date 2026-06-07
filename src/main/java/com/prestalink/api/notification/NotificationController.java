package com.prestalink.api.notification;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public List<NotificationResponse> getUserNotifications(@PathVariable Long userId) {
        return notificationService.getUserNotifications(userId);
    }

    @GetMapping("/me")
    public List<NotificationResponse> getCurrentUserNotifications(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        return notificationService.getCurrentUserNotifications(currentUserId);
    }

    @PutMapping("/{notificationId}/read")
    public NotificationResponse markAsRead(@PathVariable Long notificationId) {
        return notificationService.markAsRead(notificationId);
    }

    @GetMapping("/user/{userId}/unread-count")
    public long getUnreadCount(@PathVariable Long userId) {
        return notificationService.getUnreadCount(userId);
    }

    @GetMapping("/me/unread-count")
    public long getCurrentUserUnreadCount(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        return notificationService.getUnreadCount(currentUserId);
    }

    @PutMapping("/user/{userId}/read-all")
    public List<NotificationResponse> markAllAsRead(@PathVariable Long userId) {
        return notificationService.markAllAsRead(userId);
    }

    @PutMapping("/read-all")
    public List<NotificationResponse> markCurrentUserAllAsRead(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        return notificationService.markCurrentUserAllAsRead(currentUserId);
    }
    @DeleteMapping("/{notificationId}")
    public void deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
    }
    @GetMapping("/user/{userId}/paginated")
    public List<NotificationResponse> getUserNotificationsPaginated(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "5") int size
    ) {

        return notificationService.getUserNotificationsPaginated(
                userId,
                page,
                size
        );
    }
}

