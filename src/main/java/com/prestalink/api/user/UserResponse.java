package com.prestalink.api.user;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private UserRole role;
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
    private String emailVerifiedAt;
    private Boolean phoneVerified;
    private String phoneVerifiedAt;
    private Boolean fullyVerifiedProfile;
    private AccountStatus accountStatus;
    private String accountStatusLabel;
    private String frozenUntil;
    private String suspendedUntil;
    private Integer penaltyCount;
    private String lastPenaltyReason;
    private String country;
    private String city;
    private String streetAddress;
    private String postalCode;
    private String photoUrl;
    private Boolean newProvider;
    private Boolean selectable;
    private String trustBadge;
}

