package com.prestalink.api.recovery;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class RecoveryResponse {
    private String message;
    private String resetCode;
    private String maskedEmail;
    private boolean found;
}

