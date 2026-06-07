package com.prestalink.api.history;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class ServiceHistoryResponse {
    private List<ServiceHistoryItemResponse> providedServices;
    private List<ServiceHistoryItemResponse> requestedServices;
}

