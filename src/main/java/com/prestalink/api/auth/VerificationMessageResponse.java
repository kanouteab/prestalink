package com.prestalink.api.auth;

import com.prestalink.api.user.UserResponse;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VerificationMessageResponse {
    private String message;
    private UserResponse user;
}

