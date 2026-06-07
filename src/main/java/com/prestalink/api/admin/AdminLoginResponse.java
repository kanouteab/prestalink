package com.prestalink.api.admin;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminLoginResponse {
    private String token;
    private AdminSummary admin;
}

