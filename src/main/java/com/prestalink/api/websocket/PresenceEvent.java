package com.prestalink.api.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class PresenceEvent {
    private String type;
    private Long userId;
    private boolean online;
    private String statusLabel;
}

