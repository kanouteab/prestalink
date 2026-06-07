package com.prestalink.api.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    long countByRoleAndStatus(UserRole role, UserStatus status);
    Optional<User> findByEmail(String email);
    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByPhone(String phone);

    List<User> findByFullNameIgnoreCaseAndPhone(String fullName, String phone);

    Optional<User> findByEmailVerificationToken(String emailVerificationToken);

    List<User> findByRole(UserRole role);

    List<User> findByStatus(UserStatus status);

    List<User> findByRoleAndStatus(UserRole role, UserStatus status);
}

