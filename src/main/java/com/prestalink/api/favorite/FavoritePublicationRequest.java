package com.prestalink.api.favorite;

import lombok.Data;

@Data
public class FavoritePublicationRequest {
    private FavoritePublicationType publicationType;
    private Long publicationId;
}

