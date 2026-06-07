package com.prestalink.api.websocket;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OfferEvent {
    private String type;
    private Long offerId;
    private Long providerId;
    private String message;
}
