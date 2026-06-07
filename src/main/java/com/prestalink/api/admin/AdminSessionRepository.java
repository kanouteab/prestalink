package com.prestalink.api.admin;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AdminSessionRepository extends JpaRepository<AdminSession, Long> {
    Optional<AdminSession> findByTokenHash(String tokenHash);

    void deleteByTokenHash(String tokenHash);

    void deleteByExpiresAtBefore(LocalDateTime dateTime);
}

