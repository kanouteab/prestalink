package com.prestalink.api.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface PrestaLinkAdminRepository extends JpaRepository<PrestaLinkAdmin, Long> {
    Optional<PrestaLinkAdmin> findByEmailIgnoreCase(String email);

    Optional<PrestaLinkAdmin> findByFullNameIgnoreCase(String fullName);
}

