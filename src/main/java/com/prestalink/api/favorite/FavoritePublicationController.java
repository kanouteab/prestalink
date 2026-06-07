package com.prestalink.api.favorite;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@RequiredArgsConstructor
public class FavoritePublicationController {

    private final FavoritePublicationService favoriteService;

    @PostMapping
    public FavoritePublicationResponse addFavorite(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            @RequestBody FavoritePublicationRequest request
    ) {
        return favoriteService.addFavorite(currentUserId, request);
    }

    @DeleteMapping("/{publicationType}/{publicationId}")
    public void removeFavorite(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            @PathVariable FavoritePublicationType publicationType,
            @PathVariable Long publicationId
    ) {
        favoriteService.removeFavorite(currentUserId, publicationType, publicationId);
    }

    @GetMapping("/me")
    public List<FavoritePublicationResponse> getMyFavorites(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        return favoriteService.getMyFavorites(currentUserId);
    }

    @GetMapping("/status/{publicationType}/{publicationId}")
    public FavoriteStatusResponse getStatus(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            @PathVariable FavoritePublicationType publicationType,
            @PathVariable Long publicationId
    ) {
        return favoriteService.getStatus(currentUserId, publicationType, publicationId);
    }
}

