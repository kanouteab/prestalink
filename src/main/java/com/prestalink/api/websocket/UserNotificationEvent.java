package com.prestalink.api.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserNotificationEvent {
    private String type;
    private Long userId;
    private String title;
    private String message;
}
