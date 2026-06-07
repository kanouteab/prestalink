package com.prestalink.api.banner;

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
public class BannerService {

    private static final long MAX_IMAGE_SIZE = 5L * 1024L * 1024L;
    private static final Set<String> ACCEPTED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final BannerRepository bannerRepository;

    public List<Banner> getAll() {
        return bannerRepository.findAll();
    }

    public Banner getActive() {
        return bannerRepository.findFirstByIsActiveTrueOrderByUpdatedAtDesc().orElse(null);
    }

    @Transactional
    public Banner create(BannerAdminRequest request) {
        Banner banner = new Banner();
        applyRequest(banner, request);
        if (Boolean.TRUE.equals(banner.getIsActive())) {
            deactivateOtherBanners(null);
        }
        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner update(Long id, BannerAdminRequest request) {
        Banner banner = findBanner(id);
        applyRequest(banner, request);
        if (Boolean.TRUE.equals(banner.getIsActive())) {
            deactivateOtherBanners(id);
        }
        return bannerRepository.save(banner);
    }

    @Transactional
    public void delete(Long id) {
        bannerRepository.delete(findBanner(id));
    }

    @Transactional
    public Banner activate(Long id) {
        Banner banner = findBanner(id);
        deactivateOtherBanners(id);
        banner.setIsActive(true);
        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner uploadImage(Long id, MultipartFile image) {
        Banner banner = findBanner(id);
        validateImage(image);

        try {
            Path uploadDir = Path.of("uploads", "banners").toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String extension = extensionFor(image.getContentType());
            String filename = "banner-" + id + "-"
                    + DateTimeFormatter.ofPattern("yyyyMMddHHmmssSSS").format(LocalDateTime.now())
                    + extension;
            Path target = uploadDir.resolve(filename);
            image.transferTo(target);

            banner.setImageUrl("/uploads/banners/" + filename);
            return bannerRepository.save(banner);
        } catch (IOException error) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Impossible d'enregistrer l'image");
        }
    }

    private Banner findBanner(Long id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Banniere introuvable"));
    }

    private void applyRequest(Banner banner, BannerAdminRequest request) {
        banner.setTitle(request.getTitle());
        banner.setSubtitle(request.getSubtitle());
        banner.setPrimaryButtonText(request.getPrimaryButtonText());
        banner.setPrimaryButtonLink(request.getPrimaryButtonLink());
        banner.setSecondaryButtonText(request.getSecondaryButtonText());
        banner.setSecondaryButtonLink(request.getSecondaryButtonLink());
        banner.setImageUrl(request.getImageUrl());
        banner.setFeature1(request.getFeature1());
        banner.setFeature2(request.getFeature2());
        banner.setFeature3(request.getFeature3());
        banner.setFeature4(request.getFeature4());
        banner.setIsActive(Boolean.TRUE.equals(request.getIsActive()));
    }

    private void deactivateOtherBanners(Long activeBannerId) {
        bannerRepository.findByIsActiveTrue().forEach(existing -> {
            if (activeBannerId == null || !existing.getId().equals(activeBannerId)) {
                existing.setIsActive(false);
                bannerRepository.save(existing);
            }
        });
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Image de banniere requise");
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
}

