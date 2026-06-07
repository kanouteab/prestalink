package com.prestalink.api.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MissionEvent {
    private String type;
    private Long missionId;
    private Long clientId;
    private Long providerId;
    private String message;
}
