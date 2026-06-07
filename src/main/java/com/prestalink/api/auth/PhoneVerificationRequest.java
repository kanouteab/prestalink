package com.prestalink.api.auth;

import lombok.Data;

@Data
public class PhoneVerificationRequest {
    private Long userId;
    private String phone;
}

