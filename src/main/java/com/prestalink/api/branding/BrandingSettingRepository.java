package com.prestalink.api.branding;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BrandingSettingRepository extends JpaRepository<BrandingSetting, Long> {
    List<BrandingSetting> findByIsActiveTrue();

    Optional<BrandingSetting> findFirstByIsActiveTrueOrderByUpdatedAtDesc();
}

