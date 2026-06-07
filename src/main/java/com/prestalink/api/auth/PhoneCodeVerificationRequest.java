package com.prestalink.api.auth;

import lombok.Data;

@Data
public class PhoneCodeVerificationRequest {
    private Long userId;
    private String code;
}

