package com.prestalink.api.request;

import com.prestalink.api.photo.PhotoUploadService;
import com.prestalink.api.publication.PublicationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartHttpServletRequest;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/requests")
@RequiredArgsConstructor
public class RequestController {

    private final RequestService requestService;
    private final PhotoUploadService photoUploadService;

    @PostMapping
    public ServiceRequest createRequest(
            @RequestParam Long clientId,
            @RequestParam Long categoryId,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            @RequestBody ServiceRequest request
    ) {
        return requestService.createRequest(clientId, categoryId, currentUserId, request);
    }

    @GetMapping
    public List<RequestResponse> getAllRequests(
            @RequestParam(required = false) Long providerId,
            @RequestParam(required = false) String location
    ) {
        return requestService.getAllRequests(providerId, location);
    }

    @GetMapping("/pending")
    public List<RequestResponse> getPendingRequests() {
        return requestService.getPendingRequests();
    }
    @PutMapping("/{requestId}/cancel")
    public RequestResponse cancelRequest(@PathVariable Long requestId) {
        return requestService.cancelRequest(requestId);
    }

    @PutMapping("/{id}")
    public ServiceRequest updateRequest(
            @PathVariable Long id,
            @RequestParam Long clientId,
            @RequestParam Long categoryId,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            @RequestBody ServiceRequest request
    ) {
        return requestService.updateRequest(id, clientId, categoryId, currentUserId, request);
    }

    @PutMapping("/{id}/status")
    public RequestResponse updateRequestStatus(
            @PathVariable Long id,
            @RequestParam PublicationStatus status,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        return requestService.updateRequestStatus(id, currentUserId, status);
    }

    @GetMapping("/{id}")
    public ServiceRequest getRequestById(@PathVariable Long id) {
        return requestService.getRequestById(id);
    }

    @PostMapping("/{id}/view")
    public void registerRequestView(
            @PathVariable Long id,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        requestService.registerRequestView(id, currentUserId);
    }

    @DeleteMapping("/{id}")
    public void deleteRequest(
            @PathVariable Long id,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        requestService.deleteRequest(id, currentUserId);
    }

    @PostMapping("/{id}/photos")
    public List<String> uploadRequestPhotos(
            @PathVariable Long id,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            MultipartHttpServletRequest request
    ) {
        List<MultipartFile> images = publicationPhotoFiles(request);
        return photoUploadService.uploadRequestPhotos(id, currentUserId, images);
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

