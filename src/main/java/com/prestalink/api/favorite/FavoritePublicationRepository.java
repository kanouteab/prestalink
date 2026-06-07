package com.prestalink.api.favorite;

import com.prestalink.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FavoritePublicationRepository extends JpaRepository<FavoritePublication, Long> {
    List<FavoritePublication> findByUserOrderByCreatedAtDesc(User user);

    Optional<FavoritePublication> findByUserAndPublicationTypeAndPublicationId(
            User user,
            FavoritePublicationType publicationType,
            Long publicationId
    );

    boolean existsByUserAndPublicationTypeAndPublicationId(
            User user,
            FavoritePublicationType publicationType,
            Long publicationId
    );

    void deleteByPublicationTypeAndPublicationId(FavoritePublicationType publicationType, Long publicationId);
}

