package com.prestalink.api.favorite;

import com.prestalink.api.offer.OfferResponse;
import com.prestalink.api.request.RequestResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class FavoritePublicationResponse {
    private Long id;
    private FavoritePublicationType publicationType;
    private Long publicationId;
    private LocalDateTime createdAt;
    private Boolean available;
    private String unavailableMessage;
    private OfferResponse offer;
    private RequestResponse request;
}

