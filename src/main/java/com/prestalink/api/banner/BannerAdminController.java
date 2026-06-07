package com.prestalink.api.banner;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
public class BannerAdminController {

    private final BannerService bannerService;
    private final AdminAccessService adminAccessService;

    @GetMapping
    public List<Banner> getBanners(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return bannerService.getAll();
    }

    @GetMapping("/active")
    public Banner getActiveBanner() {
        return bannerService.getActive();
    }

    @PostMapping
    public Banner createBanner(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestBody BannerAdminRequest request
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return bannerService.create(request);
    }

    @PutMapping("/{id}")
    public Banner updateBanner(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestBody BannerAdminRequest request
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return bannerService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteBanner(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        bannerService.delete(id);
    }

    @PutMapping("/{id}/activate")
    public Banner activateBanner(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return bannerService.activate(id);
    }

    @PostMapping("/{id}/image")
    public Banner uploadBannerImage(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestParam("image") MultipartFile image
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return bannerService.uploadImage(id, image);
    }
}

