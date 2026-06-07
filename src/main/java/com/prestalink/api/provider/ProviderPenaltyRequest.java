package com.prestalink.api.provider;

import lombok.Data;

@Data
public class ProviderPenaltyRequest {
    private Integer severityScore;
    private String reason;
}

