package com.prestalink.api.recovery;

import com.prestalink.api.admin.PrestaLinkAdmin;
import com.prestalink.api.admin.PrestaLinkAdminRepository;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AccountRecoveryService {

    private static final int TOKEN_BYTES = 32;
    private static final int TOKEN_MINUTES = 30;
    private static final int MAX_ATTEMPTS = 5;
    private static final int RATE_LIMIT_MINUTES = 15;
    private static final String RESET_MESSAGE = "Si un compte existe, un lien de réinitialisation a été envoyé.";

    private final UserRepository userRepository;
    private final PrestaLinkAdminRepository adminRepository;
    private final PasswordResetTokenRepository tokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Map<String, RateLimitBucket> rateLimits = new ConcurrentHashMap<>();

    @Transactional
    public RecoveryResponse forgotPassword(AccountType accountType, ForgotPasswordRequest request) {
        String identifier = normalize(firstNonBlank(request.getEmail(), request.getUsername()));
        enforceRateLimit(accountType.name() + ":forgot:" + identifier);
        tokenRepository.deleteByExpiresAtBefore(LocalDateTime.now().minusDays(1));

        Optional<AccountRef> account = findAccountForPasswordReset(accountType, identifier);
        String token = generateToken();

        account.ifPresent(accountRef -> {
            invalidateActiveTokens(accountRef.accountType(), accountRef.accountId());
            tokenRepository.save(PasswordResetToken.builder()
                    .accountType(accountRef.accountType())
                    .accountId(accountRef.accountId())
                    .tokenHash(hashToken(token))
                    .expiresAt(LocalDateTime.now().plusMinutes(TOKEN_MINUTES))
                    .createdAt(LocalDateTime.now())
                    .build());
        });

        return RecoveryResponse.builder()
                .message(RESET_MESSAGE)
                .resetCode(token)
                .build();
    }

    @Transactional
    public RecoveryResponse resetPassword(AccountType accountType, ResetPasswordRequest request) {
        validatePasswordRequest(request);

        PasswordResetToken resetToken = tokenRepository.findByTokenHash(hashToken(request.getToken()))
                .orElseThrow(() -> invalidToken());

        if (resetToken.getAccountType() != accountType
                || resetToken.getUsedAt() != null
                || resetToken.getExpiresAt() == null
                || resetToken.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw invalidToken();
        }

        if (accountType == AccountType.USER) {
            User user = userRepository.findById(resetToken.getAccountId())
                    .orElseThrow(() -> invalidToken());
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            userRepository.save(user);
        } else {
            PrestaLinkAdmin admin = adminRepository.findById(resetToken.getAccountId())
                    .orElseThrow(() -> invalidToken());
            admin.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
            adminRepository.save(admin);
        }

        resetToken.setUsedAt(LocalDateTime.now());
        tokenRepository.save(resetToken);
        invalidateOtherActiveTokens(resetToken);

        return RecoveryResponse.builder()
                .message("Mot de passe réinitialisé avec succès")
                .build();
    }

    @Transactional(readOnly = true)
    public RecoveryResponse findEmail(AccountType accountType, FindEmailRequest request) {
        Optional<String> email = accountType == AccountType.USER
                ? findUserEmail(request)
                : findAdminEmail(request);

        return email.map(value -> RecoveryResponse.builder()
                        .found(true)
                        .message("Compte trouvé")
                        .maskedEmail(maskEmail(value))
                        .build())
                .orElseGet(() -> RecoveryResponse.builder()
                        .found(false)
                        .message("Aucun compte trouvé avec ces informations")
                        .build());
    }

    private Optional<AccountRef> findAccountForPasswordReset(AccountType accountType, String identifier) {
        if (identifier.isBlank()) {
            return Optional.empty();
        }

        if (accountType == AccountType.USER) {
            return userRepository.findByEmailIgnoreCase(identifier)
                    .map(user -> new AccountRef(AccountType.USER, user.getId()));
        }

        return adminRepository.findByEmailIgnoreCase(identifier)
                .or(() -> adminRepository.findByFullNameIgnoreCase(identifier))
                .map(admin -> new AccountRef(AccountType.ADMIN, admin.getId()));
    }

    private Optional<String> findUserEmail(FindEmailRequest request) {
        String phone = trim(request.getPhone());
        String fullName = trim(request.getFullName());

        if (!fullName.isBlank() && !phone.isBlank()) {
            return userRepository.findByFullNameIgnoreCaseAndPhone(fullName, phone).stream()
                    .findFirst()
                    .map(User::getEmail);
        }

        if (!phone.isBlank()) {
            return userRepository.findByPhone(phone).stream()
                    .findFirst()
                    .map(User::getEmail);
        }

        return Optional.empty();
    }

    private Optional<String> findAdminEmail(FindEmailRequest request) {
        String username = trim(request.getUsername());
        String fullName = trim(request.getFullName());

        if (!username.isBlank()) {
            return adminRepository.findByEmailIgnoreCase(username)
                    .or(() -> adminRepository.findByFullNameIgnoreCase(username))
                    .map(PrestaLinkAdmin::getEmail);
        }

        if (!fullName.isBlank()) {
            return adminRepository.findByFullNameIgnoreCase(fullName)
                    .map(PrestaLinkAdmin::getEmail);
        }

        return Optional.empty();
    }

    private void invalidateActiveTokens(AccountType accountType, Long accountId) {
        tokenRepository.findByAccountTypeAndAccountIdAndUsedAtIsNull(accountType, accountId)
                .forEach(token -> token.setUsedAt(LocalDateTime.now()));
    }

    private void invalidateOtherActiveTokens(PasswordResetToken usedToken) {
        tokenRepository.findByAccountTypeAndAccountIdAndUsedAtIsNull(
                        usedToken.getAccountType(),
                        usedToken.getAccountId()
                ).stream()
                .filter(token -> !token.getId().equals(usedToken.getId()))
                .forEach(token -> token.setUsedAt(LocalDateTime.now()));
    }

    private void validatePasswordRequest(ResetPasswordRequest request) {
        if (request.getToken() == null || request.getToken().isBlank()) {
            throw invalidToken();
        }

        String password = request.getNewPassword();
        if (password == null || !password.equals(request.getConfirmPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Les mots de passe ne correspondent pas");
        }

        if (!isStrongPassword(password)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre"
            );
        }
    }

    private boolean isStrongPassword(String password) {
        return password != null
                && password.length() >= 8
                && password.chars().anyMatch(Character::isUpperCase)
                && password.chars().anyMatch(Character::isLowerCase)
                && password.chars().anyMatch(Character::isDigit);
    }

    private void enforceRateLimit(String key) {
        String normalizedKey = key.toLowerCase(Locale.ROOT);
        LocalDateTime now = LocalDateTime.now();
        RateLimitBucket bucket = rateLimits.compute(normalizedKey, (ignored, existing) -> {
            if (existing == null || existing.windowStart().plusMinutes(RATE_LIMIT_MINUTES).isBefore(now)) {
                return new RateLimitBucket(now, 1);
            }
            return new RateLimitBucket(existing.windowStart(), existing.count() + 1);
        });

        if (bucket.count() > MAX_ATTEMPTS) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Trop de tentatives. Veuillez réessayer plus tard.");
        }
    }

    private String generateToken() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (NoSuchAlgorithmException error) {
            throw new IllegalStateException("SHA-256 is not available", error);
        }
    }

    private String maskEmail(String email) {
        int atIndex = email.indexOf("@");
        if (atIndex <= 1) {
            return "***" + (atIndex >= 0 ? email.substring(atIndex) : "");
        }

        String local = email.substring(0, atIndex);
        String domain = email.substring(atIndex);
        int visible = Math.min(2, local.length());
        return local.substring(0, visible) + "***" + domain;
    }

    private String firstNonBlank(String first, String second) {
        String value = trim(first);
        return value.isBlank() ? trim(second) : value;
    }

    private String normalize(String value) {
        return trim(value).toLowerCase(Locale.ROOT);
    }

    private String trim(String value) {
        return value == null ? "" : value.trim();
    }

    private ResponseStatusException invalidToken() {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, "Lien de réinitialisation invalide ou expiré");
    }

    private record AccountRef(AccountType accountType, Long accountId) {
    }

    private record RateLimitBucket(LocalDateTime windowStart, int count) {
    }
}

