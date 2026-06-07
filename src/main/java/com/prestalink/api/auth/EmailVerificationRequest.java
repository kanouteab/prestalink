package com.prestalink.api.auth;

import lombok.Data;

@Data
public class EmailVerificationRequest {
    private Long userId;
    private String email;
}

