package com.prestalink.api.offer;

import com.prestalink.api.category.ServiceCategory;
import com.prestalink.api.publication.PublicationStatus;
import com.prestalink.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OfferRepository extends JpaRepository<ServiceOffer, Long> {

    List<ServiceOffer> findByProvider(User provider);

    List<ServiceOffer> findByCategory(ServiceCategory category);

    List<ServiceOffer> findByActiveTrue();

    List<ServiceOffer> findByStatus(PublicationStatus status);
}

