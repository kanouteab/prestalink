package com.prestalink.api.banner;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BannerRepository extends JpaRepository<Banner, Long> {
    List<Banner> findByIsActiveTrue();

    Optional<Banner> findFirstByIsActiveTrueOrderByUpdatedAtDesc();
}

