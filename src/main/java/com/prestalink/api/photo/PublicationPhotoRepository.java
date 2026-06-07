package com.prestalink.api.photo;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PublicationPhotoRepository extends JpaRepository<PublicationPhoto, Long> {
    List<PublicationPhoto> findByPublicationTypeAndPublicationId(String publicationType, Long publicationId);
}

