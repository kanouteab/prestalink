package com.prestalink.api.auth;

import com.prestalink.api.provider.ProviderTrustService;
import com.prestalink.api.user.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ProviderTrustService providerTrustService;
    private final VerificationService verificationService;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email déjà utilisé");
        }

        User user = User.builder()
                .fullName(request.getFullName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .password(passwordEncoder.encode(request.getPassword()))
                .country(request.getCountry())
                .streetAddress(request.getStreetAddress())
                .postalCode(request.getPostalCode())
                .status(UserStatus.DISPONIBLE)
                .rating(0.0)
                .emailVerified(false)
                .phoneVerified(false)
                .verifiedProfile(false)
                .build();

        verificationService.prepareEmailVerification(user);
        User savedUser = userRepository.save(user);
        verificationService.sendVerificationEmail(emailRequest(savedUser.getId(), savedUser.getEmail()));

        return AuthResponse.builder()
                .message("Inscription réussie")
                .user(toUserResponse(savedUser))
                .build();
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Email ou mot de passe incorrect");
        }

        return AuthResponse.builder()
                .message("Connexion réussie")
                .user(toUserResponse(user))
                .build();
    }

    public UserResponse toUserResponse(User user) {
        return providerTrustService.toUserResponse(user);
    }

    private EmailVerificationRequest emailRequest(Long userId, String email) {
        EmailVerificationRequest request = new EmailVerificationRequest();
        request.setUserId(userId);
        request.setEmail(email);
        return request;
    }
}

