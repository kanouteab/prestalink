package com.prestalink.api.recovery;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByTokenHash(String tokenHash);

    List<PasswordResetToken> findByAccountTypeAndAccountIdAndUsedAtIsNull(AccountType accountType, Long accountId);

    void deleteByExpiresAtBefore(LocalDateTime expiresAt);
}

