package com.prestalink.api.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatReadEvent {
    private String type;
    private Long missionId;
    private Long messageId;
    private Long readerId;
}
