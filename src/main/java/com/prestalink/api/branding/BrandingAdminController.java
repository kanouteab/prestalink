package com.prestalink.api.branding;

import com.prestalink.api.banner.AdminAccessService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/admin/branding")
@RequiredArgsConstructor
public class BrandingAdminController {

    private final BrandingService brandingService;
    private final AdminAccessService adminAccessService;

    @GetMapping
    public List<BrandingSetting> getBrandingSettings(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return brandingService.getAll();
    }

    @GetMapping("/active")
    public BrandingSetting getActiveBranding() {
        return brandingService.getActive();
    }

    @PostMapping
    public BrandingSetting createBranding(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestBody BrandingRequest request
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return brandingService.create(request);
    }

    @PutMapping("/{id}")
    public BrandingSetting updateBranding(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestBody BrandingRequest request
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return brandingService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public void deleteBranding(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        brandingService.delete(id);
    }

    @PutMapping("/{id}/activate")
    public BrandingSetting activateBranding(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return brandingService.activate(id);
    }

    @PostMapping("/{id}/favicon")
    public BrandingSetting uploadFavicon(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestParam("image") MultipartFile image
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return brandingService.uploadFavicon(id, image);
    }

    @PostMapping("/{id}/sidebar-logo")
    public BrandingSetting uploadSidebarLogo(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestParam("image") MultipartFile image
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return brandingService.uploadSidebarLogo(id, image);
    }

    @PostMapping("/{id}/login-logo")
    public BrandingSetting uploadLoginLogo(
            @PathVariable Long id,
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken,
            @RequestParam("image") MultipartFile image
    ) {
        adminAccessService.requireAdmin(authorization, adminToken);
        return brandingService.uploadLoginLogo(id, image);
    }
}

