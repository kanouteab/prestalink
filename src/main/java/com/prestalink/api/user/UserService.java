package com.prestalink.api.user;

import com.prestalink.api.auth.VerificationService;
import com.prestalink.api.provider.ProviderTrustService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ProviderTrustService providerTrustService;
    private final VerificationService verificationService;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public List<UserResponse> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(providerTrustService::toUserResponse)
                .toList();
    }

    public List<User> getUsersByRole(UserRole role) {
        return userRepository.findByRole(role);
    }

    public List<User> getAvailableProviders() {
        return userRepository.findByRoleAndStatus(
                UserRole.PRESTATAIRE,
                UserStatus.DISPONIBLE
        )
                .stream()
                .filter(providerTrustService::isProviderSelectable)
                .toList();
    }

    public User updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        user.setStatus(status);
        return userRepository.save(user);
    }

    public List<UserResponse> getProvidersFeed() {
        return userRepository.findByRole(UserRole.PRESTATAIRE)
                .stream()
                .filter(providerTrustService::isProviderSelectable)
                .sorted(providerTrustService.providerComparator(null))
                .map(providerTrustService::toUserResponse)
                .toList();
    }

    public UserResponse updateUser(Long id, User updatedUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));

        boolean emailChanged = updatedUser.getEmail() != null && !updatedUser.getEmail().equals(user.getEmail());
        boolean phoneChanged = updatedUser.getPhone() != null && !updatedUser.getPhone().equals(user.getPhone());

        user.setFullName(updatedUser.getFullName());
        user.setEmail(updatedUser.getEmail());
        user.setPhone(updatedUser.getPhone());
        user.setRole(updatedUser.getRole());
        user.setStreetAddress(updatedUser.getStreetAddress());
        user.setCity(updatedUser.getCity());
        user.setPostalCode(updatedUser.getPostalCode());
        user.setCountry(updatedUser.getCountry());
        user.setLatitude(updatedUser.getLatitude());
        user.setLongitude(updatedUser.getLongitude());

        if (emailChanged) {
            verificationService.prepareEmailVerification(user);
        }

        if (phoneChanged) {
            user.setPhoneVerified(false);
            user.setPhoneVerifiedAt(null);
            user.setPhoneVerificationCode(null);
            user.setPhoneVerificationExpiresAt(null);
        }

        verificationService.refreshProfileVerification(user);

        User savedUser = userRepository.save(user);

        if (emailChanged) {
            verificationService.sendVerificationEmail(emailRequest(savedUser.getId(), savedUser.getEmail()));
        }

        return providerTrustService.toUserResponse(savedUser);
    }

    private com.prestalink.api.auth.EmailVerificationRequest emailRequest(Long userId, String email) {
        com.prestalink.api.auth.EmailVerificationRequest request = new com.prestalink.api.auth.EmailVerificationRequest();
        request.setUserId(userId);
        request.setEmail(email);
        return request;
    }

}

