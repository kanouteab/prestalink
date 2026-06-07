package com.prestalink.api.branding;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class BrandingService {

    private static final long MAX_IMAGE_SIZE = 2L * 1024L * 1024L;
    private static final Set<String> ACCEPTED_IMAGE_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp"
    );
    private static final String DEFAULT_PRIMARY_COLOR = "#0d6efd";
    private static final String DEFAULT_SECONDARY_COLOR = "#6610f2";
    private static final String DEFAULT_SLOGAN = "Plateforme temps reel de mise en relation clients et prestataires";

    private final BrandingSettingRepository brandingRepository;

    public List<BrandingSetting> getAll() {
        return brandingRepository.findAll();
    }

    public BrandingSetting getActive() {
        return brandingRepository.findFirstByIsActiveTrueOrderByUpdatedAtDesc()
                .orElseGet(this::defaultBranding);
    }

    @Transactional
    public BrandingSetting create(BrandingRequest request) {
        BrandingSetting branding = new BrandingSetting();
        applyRequest(branding, request);
        if (Boolean.TRUE.equals(branding.getIsActive())) {
            deactivateOtherBranding(null);
        }
        return brandingRepository.save(branding);
    }

    @Transactional
    public BrandingSetting update(Long id, BrandingRequest request) {
        BrandingSetting branding = findBranding(id);
        applyRequest(branding, request);
        if (Boolean.TRUE.equals(branding.getIsActive())) {
            deactivateOtherBranding(id);
        }
        return brandingRepository.save(branding);
    }

    @Transactional
    public void delete(Long id) {
        brandingRepository.delete(findBranding(id));
    }

    @Transactional
    public BrandingSetting activate(Long id) {
        BrandingSetting branding = findBranding(id);
        deactivateOtherBranding(id);
        branding.setIsActive(true);
        return brandingRepository.save(branding);
    }

    @Transactional
    public BrandingSetting uploadFavicon(Long id, MultipartFile image) {
        BrandingSetting branding = findBranding(id);
        branding.setFaviconUrl(storeImage(id, "favicon", image));
        return brandingRepository.save(branding);
    }

    @Transactional
    public BrandingSetting uploadSidebarLogo(Long id, MultipartFile image) {
        BrandingSetting branding = findBranding(id);
        branding.setSidebarLogoUrl(storeImage(id, "sidebar-logo", image));
        return brandingRepository.save(branding);
    }

    @Transactional
    public BrandingSetting uploadLoginLogo(Long id, MultipartFile image) {
        BrandingSetting branding = findBranding(id);
        branding.setLoginLogoUrl(storeImage(id, "login-logo", image));
        return brandingRepository.save(branding);
    }

    private BrandingSetting findBranding(Long id) {
        return brandingRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Branding introuvable"));
    }

    private void applyRequest(BrandingSetting branding, BrandingRequest request) {
        branding.setFaviconUrl(cleanText(request.getFaviconUrl(), 1000));
        branding.setSidebarLogoUrl(cleanText(request.getSidebarLogoUrl(), 1000));
        branding.setLoginLogoUrl(cleanText(request.getLoginLogoUrl(), 1000));
        branding.setPrimaryColor(validColorOrDefault(request.getPrimaryColor(), DEFAULT_PRIMARY_COLOR));
        branding.setSecondaryColor(validColorOrDefault(request.getSecondaryColor(), DEFAULT_SECONDARY_COLOR));
        branding.setSlogan(cleanText(request.getSlogan(), 500));
        branding.setIsActive(Boolean.TRUE.equals(request.getIsActive()));
    }

    private void deactivateOtherBranding(Long activeBrandingId) {
        brandingRepository.findByIsActiveTrue().forEach(existing -> {
            if (activeBrandingId == null || !existing.getId().equals(activeBrandingId)) {
                existing.setIsActive(false);
                brandingRepository.save(existing);
            }
        });
    }

    private String storeImage(Long brandingId, String field, MultipartFile image) {
        validateImage(image);

        try {
            Path uploadDir = Path.of("uploads", "branding").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String extension = extensionFor(image.getContentType());
            String timestamp = DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS").format(LocalDateTime.now());
            String filename = "branding-" + brandingId + "-" + sanitizeSegment(field) + "-" + timestamp + extension;
            Path target = uploadDir.resolve(filename).normalize();
            if (!target.startsWith(uploadDir)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nom de fichier invalide");
            }

            image.transferTo(target);
            return "/uploads/branding/" + filename;
        } catch (IOException error) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Impossible d'enregistrer l'image");
        }
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image requise");
        }
        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image trop volumineuse");
        }
        if (!ACCEPTED_IMAGE_TYPES.contains(image.getContentType())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type d'image non accepte");
        }
    }

    private String extensionFor(String contentType) {
        if ("image/png".equals(contentType)) {
            return ".png";
        }
        if ("image/webp".equals(contentType)) {
            return ".webp";
        }
        return ".jpg";
    }

    private String validColorOrDefault(String value, String fallback) {
        String color = cleanText(value, 20);
        if (color == null || color.isBlank()) {
            return fallback;
        }
        if (!color.matches("^#[0-9a-fA-F]{6}$")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Couleur invalide");
        }
        return color;
    }

    private String cleanText(String value, int maxLength) {
        if (value == null) {
            return "";
        }
        String cleaned = value.trim();
        if (cleaned.length() > maxLength) {
            return cleaned.substring(0, maxLength);
        }
        return cleaned;
    }

    private String sanitizeSegment(String value) {
        return value == null ? "file" : value.replaceAll("[^a-zA-Z0-9-]", "-");
    }

    private BrandingSetting defaultBranding() {
        return BrandingSetting.builder()
                .id(null)
                .faviconUrl("")
                .sidebarLogoUrl("")
                .loginLogoUrl("")
                .primaryColor(DEFAULT_PRIMARY_COLOR)
                .secondaryColor(DEFAULT_SECONDARY_COLOR)
                .slogan(DEFAULT_SLOGAN)
                .isActive(true)
                .build();
    }
}

