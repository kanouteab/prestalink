package com.prestalink.api.offer;

import com.prestalink.api.photo.PhotoUploadService;
import com.prestalink.api.publication.PublicationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/offers")
@RequiredArgsConstructor
public class OfferController {

    private final OfferService offerService;
    private final PhotoUploadService photoUploadService;

    @PostMapping
    public ServiceOffer createOffer(
            @RequestParam Long providerId,
            @RequestParam Long categoryId,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            @RequestBody ServiceOffer offer
    ) {
        return offerService.createOffer(providerId, categoryId, currentUserId, offer);
    }

    @GetMapping
    public List<ServiceOffer> getAllOffers() {
        return offerService.getAllOffers();
    }

    @GetMapping("/active")
    public List<ServiceOffer> getActiveOffers() {
        return offerService.getActiveOffers();
    }
    @GetMapping("/feed")

    public List<OfferResponse> getOffersFeed(
            @RequestParam(required = false) String location
    ) {
        return offerService.getOffersFeed(location);
    }

    @GetMapping("/{id}")
    public ServiceOffer getOfferById(@PathVariable Long id) {
        return offerService.getOfferById(id);
    }

    @PostMapping("/{id}/view")
    public void registerOfferView(
            @PathVariable Long id,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        offerService.registerOfferView(id, currentUserId);
    }

    @PutMapping("/{id}")
    public ServiceOffer updateOffer(
            @PathVariable Long id,
            @RequestParam Long providerId,
            @RequestParam Long categoryId,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            @RequestBody ServiceOffer offer
    ) {
        return offerService.updateOffer(id, providerId, categoryId, currentUserId, offer);
    }

    @PutMapping("/{id}/status")
    public OfferResponse updateOfferStatus(
            @PathVariable Long id,
            @RequestParam PublicationStatus status,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        return offerService.updateOfferStatus(id, currentUserId, status);
    }

    @DeleteMapping("/{id}")
    public void deleteOffer(
            @PathVariable Long id,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        offerService.deleteOffer(id, currentUserId);
    }

    @PostMapping("/{id}/photos")
    public List<String> uploadOfferPhotos(
            @PathVariable Long id,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            MultipartHttpServletRequest request
    ) {
        List<MultipartFile> images = publicationPhotoFiles(request);
        return photoUploadService.uploadOfferPhotos(id, currentUserId, images);
    }

    private List<MultipartFile> publicationPhotoFiles(MultipartHttpServletRequest request) {
        List<MultipartFile> files = new ArrayList<>();
        files.addAll(request.getFiles("images"));
        files.addAll(request.getFiles("photos"));
        files.addAll(request.getFiles("files"));
        files.addAll(request.getFiles("image"));
        return files;
    }
}

