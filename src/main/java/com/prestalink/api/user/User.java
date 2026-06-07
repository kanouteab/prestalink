package com.prestalink.api.user;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String country;
    private String city;
    @NotBlank
    private String fullName;

    @Email
    @Column(unique = true)
    private String email;

    private String phone;

    private String password;

    @Enumerated(EnumType.STRING)
    private UserRole role;

    @Enumerated(EnumType.STRING)
    private UserStatus status;

    private Double latitude;

    private Double longitude;

    private Double rating;

    private Double ratingAverage;

    private Integer ratingCount;

    private Double trustScore;

    private Integer completedServices;

    private Boolean verifiedProfile;

    private Boolean emailVerified;

    @Column(unique = true)
    private String emailVerificationToken;

    private LocalDateTime emailVerificationExpiresAt;

    private LocalDateTime emailVerifiedAt;

    private Boolean phoneVerified;

    private String phoneVerificationCode;

    private LocalDateTime phoneVerificationExpiresAt;

    private LocalDateTime phoneVerifiedAt;

    @Enumerated(EnumType.STRING)
    private AccountStatus accountStatus;

    private LocalDateTime frozenUntil;

    private LocalDateTime suspendedUntil;

    private Integer penaltyCount;

    @Column(length = 500)
    private String lastPenaltyReason;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;


    private String streetAddress;

    private String postalCode;

    @Column(length = 500)
    private String photoUrl;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();

        if (status == null) {
            status = UserStatus.DISPONIBLE;
        }

        if (rating == null) {
            rating = 0.0;
        }

        if (ratingAverage == null) {
            ratingAverage = 0.0;
        }

        if (ratingCount == null) {
            ratingCount = 0;
        }

        if (trustScore == null) {
            trustScore = 50.0;
        }

        if (completedServices == null) {
            completedServices = 0;
        }

        if (verifiedProfile == null) {
            verifiedProfile = false;
        }

        if (emailVerified == null) {
            emailVerified = false;
        }

        if (phoneVerified == null) {
            phoneVerified = false;
        }

        if (accountStatus == null) {
            accountStatus = AccountStatus.ACTIF;
        }

        if (penaltyCount == null) {
            penaltyCount = 0;
        }
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}

