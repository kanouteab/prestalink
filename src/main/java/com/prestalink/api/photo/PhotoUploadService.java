package com.prestalink.api.photo;

import com.prestalink.api.offer.OfferRepository;
import com.prestalink.api.offer.ServiceOffer;
import com.prestalink.api.provider.ProviderTrustService;
import com.prestalink.api.request.RequestRepository;
import com.prestalink.api.request.ServiceRequest;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import com.prestalink.api.user.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PhotoUploadService {

    private static final long MAX_IMAGE_SIZE = 10L * 1024L * 1024L;
    private static final int MAX_PUBLICATION_PHOTOS = 3;
    private static final Set<String> ACCEPTED_IMAGE_TYPES = Set.of("image/jpeg", "image/png", "image/webp");

    private final UserRepository userRepository;
    private final OfferRepository offerRepository;
    private final RequestRepository requestRepository;
    private final PublicationPhotoRepository photoRepository;
    private final ProviderTrustService providerTrustService;

    public UserResponse uploadProfilePhoto(Long currentUserId, MultipartFile image) {
        if (currentUserId == null) {
            throw new RuntimeException("Utilisateur non authentifié");
        }

        validateImage(image);
        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
        String url = storeImage(image, "profiles");
        user.setPhotoUrl(url);
        return providerTrustService.toUserResponse(userRepository.save(user));
    }

    public List<String> uploadOfferPhotos(Long offerId, Long currentUserId, List<MultipartFile> images) {
        ServiceOffer offer = offerRepository.findById(offerId)
                .orElseThrow(() -> new RuntimeException("Offre introuvable"));

        if (currentUserId == null || !offer.getProvider().getId().equals(currentUserId)) {
            throw new RuntimeException("Accès refusé");
        }

        List<String> urls = uploadPublicationPhotos("OFFER", offerId, currentUserId, offer.getPhotoUrls(), images);
        offer.setPhotoUrls(urls);
        return offerRepository.save(offer).getPhotoUrls();
    }

    public List<String> uploadRequestPhotos(Long requestId, Long currentUserId, List<MultipartFile> images) {
        ServiceRequest request = requestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Demande introuvable"));

        if (currentUserId == null || !request.getClient().getId().equals(currentUserId)) {
            throw new RuntimeException("Accès refusé");
        }

        List<String> urls = uploadPublicationPhotos("REQUEST", requestId, currentUserId, request.getPhotoUrls(), images);
        request.setPhotoUrls(urls);
        return requestRepository.save(request).getPhotoUrls();
    }

    public void deletePhoto(Long photoId, Long currentUserId) {
        PublicationPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new RuntimeException("Photo introuvable"));

        if (currentUserId == null || !photo.getOwnerId().equals(currentUserId)) {
            throw new RuntimeException("Accès refusé");
        }

        if ("OFFER".equals(photo.getPublicationType())) {
            ServiceOffer offer = offerRepository.findById(photo.getPublicationId())
                    .orElseThrow(() -> new RuntimeException("Offre introuvable"));
            offer.getPhotoUrls().remove(photo.getFileUrl());
            offerRepository.save(offer);
        } else if ("REQUEST".equals(photo.getPublicationType())) {
            ServiceRequest request = requestRepository.findById(photo.getPublicationId())
                    .orElseThrow(() -> new RuntimeException("Demande introuvable"));
            request.getPhotoUrls().remove(photo.getFileUrl());
            requestRepository.save(request);
        }

        photoRepository.delete(photo);
    }

    private List<String> uploadPublicationPhotos(
            String publicationType,
            Long publicationId,
            Long ownerId,
            List<String> existingUrls,
            List<MultipartFile> images
    ) {
        List<MultipartFile> files = images == null ? List.of() : images;
        List<String> persistedUrls = photoRepository.findByPublicationTypeAndPublicationId(publicationType, publicationId)
                .stream()
                .map(PublicationPhoto::getFileUrl)
                .filter(url -> url != null && !url.isBlank())
                .toList();
        List<String> baseUrls = persistedUrls.isEmpty()
                ? existingUrls == null ? List.of() : existingUrls
                : persistedUrls;
        List<String> urls = new ArrayList<>(baseUrls);

        if (urls.size() + files.size() > MAX_PUBLICATION_PHOTOS) {
            throw new RuntimeException("Maximum 3 photos par publication.");
        }

        files.forEach(this::validateImage);

        for (MultipartFile image : files) {
            String url = storeImage(image, publicationType.toLowerCase());
            urls.add(url);
            photoRepository.save(PublicationPhoto.builder()
                    .fileName(Path.of(url).getFileName().toString())
                    .fileUrl(url)
                    .contentType(image.getContentType())
                    .fileType(image.getContentType())
                    .size(image.getSize())
                    .ownerId(ownerId)
                    .publicationId(publicationId)
                    .publicationType(publicationType)
                    .build());
        }

        return urls;
    }

    private void validateImage(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new RuntimeException("Image requise.");
        }

        if (image.getSize() > MAX_IMAGE_SIZE) {
            throw new RuntimeException("Image trop volumineuse.");
        }

        String contentType = image.getContentType();
        if (!ACCEPTED_IMAGE_TYPES.contains(contentType)) {
            throw new RuntimeException("Type de fichier non autorisé.");
        }
    }

    private String storeImage(MultipartFile image, String folder) {
        try {
            Path uploadDir = Path.of("uploads", folder).toAbsolutePath().normalize();
            Files.createDirectories(uploadDir);

            String extension = extensionFor(image.getContentType());
            String filename = UUID.randomUUID() + extension;
            Path target = uploadDir.resolve(filename).normalize();

            if (!target.startsWith(uploadDir)) {
                throw new RuntimeException("Nom de fichier invalide.");
            }

            Files.copy(image.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/" + folder + "/" + filename;
        } catch (IOException error) {
            throw new RuntimeException("Upload image impossible.");
        }
    }

    private String extensionFor(String contentType) {
        return switch (contentType) {
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> ".jpg";
        };
    }
}

