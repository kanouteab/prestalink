package com.prestalink.api.admin;

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

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private static final int TOKEN_BYTES = 32;
    private static final int SESSION_HOURS = 12;

    private final PrestaLinkAdminRepository adminRepository;
    private final AdminSessionRepository sessionRepository;
    private final PasswordEncoder passwordEncoder;
    private final SecureRandom secureRandom = new SecureRandom();

    @Transactional
    public AdminLoginResponse login(AdminLoginRequest request) {
        String login = request.getEmail() != null ? request.getEmail() : request.getUsername();
        if (login == null || login.isBlank() || request.getPassword() == null) {
            throw unauthorized();
        }

        PrestaLinkAdmin admin = adminRepository.findByEmailIgnoreCase(login.trim())
                .orElseThrow(this::unauthorized);

        if (!isAllowedAdmin(admin) || !passwordEncoder.matches(request.getPassword(), admin.getPasswordHash())) {
            throw unauthorized();
        }

        sessionRepository.deleteByExpiresAtBefore(LocalDateTime.now());

        String token = generateToken();
        AdminSession session = AdminSession.builder()
                .admin(admin)
                .tokenHash(hashToken(token))
                .expiresAt(LocalDateTime.now().plusHours(SESSION_HOURS))
                .build();
        sessionRepository.save(session);

        return AdminLoginResponse.builder()
                .token(token)
                .admin(AdminSummary.from(admin))
                .build();
    }

    @Transactional(readOnly = true)
    public PrestaLinkAdmin requireAdmin(String authorizationHeader, String adminTokenHeader) {
        String token = resolveToken(authorizationHeader, adminTokenHeader);
        if (token == null) {
            throw forbidden();
        }

        AdminSession session = sessionRepository.findByTokenHash(hashToken(token))
                .orElseThrow(this::forbidden);
        if (session.getExpiresAt() == null || session.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw forbidden();
        }
        if (!isAllowedAdmin(session.getAdmin())) {
            throw forbidden();
        }
        return session.getAdmin();
    }

    @Transactional
    public void logout(String authorizationHeader, String adminTokenHeader) {
        String token = resolveToken(authorizationHeader, adminTokenHeader);
        if (token != null) {
            sessionRepository.deleteByTokenHash(hashToken(token));
        }
    }

    private boolean isAllowedAdmin(PrestaLinkAdmin admin) {
        return admin != null
                && "ADMIN".equals(admin.getRole())
                && Boolean.TRUE.equals(admin.getIsActive());
    }

    private String resolveToken(String authorizationHeader, String adminTokenHeader) {
        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            return authorizationHeader.substring("Bearer ".length()).trim();
        }
        if (adminTokenHeader != null && !adminTokenHeader.isBlank()) {
            return adminTokenHeader.trim();
        }
        return null;
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

    private ResponseStatusException unauthorized() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Identifiants administrateur invalides");
    }

    private ResponseStatusException forbidden() {
        return new ResponseStatusException(HttpStatus.FORBIDDEN, "Acces reserve aux administrateurs");
    }
}

