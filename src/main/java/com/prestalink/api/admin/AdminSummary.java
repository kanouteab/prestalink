package com.prestalink.api.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminSummary {
    private Long id;
    private String fullName;
    private String email;
    private String role;

    public static AdminSummary from(PrestaLinkAdmin admin) {
        return AdminSummary.builder()
                .id(admin.getId())
                .fullName(admin.getFullName())
                .email(admin.getEmail())
                .role(admin.getRole())
                .build();
    }
}

