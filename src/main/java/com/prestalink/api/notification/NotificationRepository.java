package com.prestalink.api.notification;

import com.prestalink.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository
        extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndIsReadFalse(User user);
    boolean existsByUserAndTypeAndRelatedPublicationIdAndActorUserIdAndCreatedAtAfter(
            User user,
            String type,
            Long relatedPublicationId,
            Long actorUserId,
            LocalDateTime createdAt
    );

    Page<Notification> findByUserOrderByCreatedAtDesc(
            User user,
            Pageable pageable
    );
}

