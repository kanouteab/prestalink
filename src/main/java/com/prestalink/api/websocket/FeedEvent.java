package com.prestalink.api.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FeedEvent {
    private String type;
    private String message;
}
