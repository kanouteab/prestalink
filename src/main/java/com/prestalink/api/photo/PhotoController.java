package com.prestalink.api.photo;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/photos")
@RequiredArgsConstructor
public class PhotoController {

    private final PhotoUploadService photoUploadService;

    @DeleteMapping("/{id}")
    public void deletePhoto(
            @PathVariable Long id,
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        photoUploadService.deletePhoto(id, currentUserId);
    }
}

