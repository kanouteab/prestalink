package com.prestalink.api.auth;

import com.prestalink.api.provider.ProviderTrustService;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import com.prestalink.api.user.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationService {

    private static final int EMAIL_TOKEN_HOURS = 24;
    private static final int PHONE_CODE_MINUTES = 10;
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final ProviderTrustService providerTrustService;

    @Value("${app.public-base-url}")
    private String publicBaseUrl;

    public void prepareEmailVerification(User user) {
        user.setEmailVerified(false);
        user.setEmailVerifiedAt(null);
        user.setEmailVerificationToken(generateToken());
        user.setEmailVerificationExpiresAt(LocalDateTime.now().plusHours(EMAIL_TOKEN_HOURS));
        refreshProfileVerification(user);
    }

    public VerificationMessageResponse sendVerificationEmail(EmailVerificationRequest request) {
        User user = findUserForEmailVerification(request);

        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            return response("Email déjà vérifié", user);
        }

        prepareEmailVerification(user);
        User savedUser = userRepository.save(user);
        sendEmailVerificationLink(savedUser);

        return response("Email de vérification envoyé", savedUser);
    }

    public VerificationMessageResponse verifyEmail(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Code invalide");
        }

        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new RuntimeException("Code invalide"));

        if (user.getEmailVerificationExpiresAt() == null
                || user.getEmailVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Code expiré");
        }

        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        user.setEmailVerificationToken(null);
        user.setEmailVerificationExpiresAt(null);
        refreshProfileVerification(user);

        return response("Vérification réussie", userRepository.save(user));
    }

    public VerificationMessageResponse sendPhoneVerificationCode(PhoneVerificationRequest request) {
        if (request.getUserId() == null) {
            throw new RuntimeException("Utilisateur introuvable");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (request.getPhone() != null && !request.getPhone().isBlank()
                && !request.getPhone().equals(user.getPhone())) {
            user.setPhone(request.getPhone());
            user.setPhoneVerified(false);
            user.setPhoneVerifiedAt(null);
        }

        if (user.getPhone() == null || user.getPhone().isBlank()) {
            throw new RuntimeException("Téléphone non renseigné");
        }

        String code = generatePhoneCode();
        user.setPhoneVerificationCode(code);
        user.setPhoneVerificationExpiresAt(LocalDateTime.now().plusMinutes(PHONE_CODE_MINUTES));
        refreshProfileVerification(user);

        User savedUser = userRepository.save(user);
        sendSmsVerificationCode(savedUser, code);

        return response("Code de vérification envoyé", savedUser);
    }

    public VerificationMessageResponse verifyPhone(PhoneCodeVerificationRequest request) {
        if (request.getUserId() == null || request.getCode() == null || request.getCode().isBlank()) {
            throw new RuntimeException("Code invalide");
        }

        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        if (user.getPhoneVerificationCode() == null
                || !user.getPhoneVerificationCode().equals(request.getCode().trim())) {
            throw new RuntimeException("Code invalide");
        }

        if (user.getPhoneVerificationExpiresAt() == null
                || user.getPhoneVerificationExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Code expiré");
        }

        user.setPhoneVerified(true);
        user.setPhoneVerifiedAt(LocalDateTime.now());
        user.setPhoneVerificationCode(null);
        user.setPhoneVerificationExpiresAt(null);
        refreshProfileVerification(user);

        return response("Vérification réussie", userRepository.save(user));
    }

    public void refreshProfileVerification(User user) {
        user.setVerifiedProfile(Boolean.TRUE.equals(user.getEmailVerified()));
    }

    private User findUserForEmailVerification(EmailVerificationRequest request) {
        if (request.getUserId() != null) {
            return userRepository.findById(request.getUserId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        }

        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            return userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        }

        throw new RuntimeException("Utilisateur introuvable");
    }

    private VerificationMessageResponse response(String message, User user) {
        UserResponse userResponse = providerTrustService.toUserResponse(user);

        return VerificationMessageResponse.builder()
                .message(message)
                .user(userResponse)
                .build();
    }

    private String generateToken() {
        return UUID.randomUUID() + "-" + UUID.randomUUID();
    }

    private String generatePhoneCode() {
        return String.valueOf(100000 + RANDOM.nextInt(900000));
    }

    private void sendEmailVerificationLink(User user) {
        String link = publicBaseUrl.replaceAll("/+$", "") + "/api/auth/verify-email?token=" + user.getEmailVerificationToken();
        System.out.println("Lien de vérification email PrestaLink pour " + user.getEmail() + " : " + link);
    }

    private void sendSmsVerificationCode(User user, String code) {
        System.out.println("Code de vérification téléphone PrestaLink pour " + user.getPhone() + " : " + code);
    }
}

