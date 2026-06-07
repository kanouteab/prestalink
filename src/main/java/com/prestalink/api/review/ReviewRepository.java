package com.prestalink.api.review;

import com.prestalink.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByProvider(User provider);
    List<Review> findByProviderOrderByCreatedAtDesc(User provider);
    Optional<Review> findByMissionId(Long missionId);
}

