package com.prestalink.api.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TypingEvent {

    private String type;

    private Long missionId;

    private Long userId;

    private String userName;
}
