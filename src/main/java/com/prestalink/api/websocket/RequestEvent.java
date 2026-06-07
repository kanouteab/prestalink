package com.prestalink.api.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RequestEvent {
    private String type;
    private Long requestId;
    private Long clientId;
    private String message;
}
