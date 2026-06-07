package com.prestalink.api.favorite;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FavoriteStatusResponse {
    private FavoritePublicationType publicationType;
    private Long publicationId;
    private Boolean favorite;
}

