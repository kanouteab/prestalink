package com.prestalink.api.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UnreadCountEvent {

    private String type;

    private Long missionId;

    private Long readerId;

    private Long unreadCount;
}

