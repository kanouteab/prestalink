package com.prestalink.api.request;

import com.prestalink.api.category.ServiceCategory;
import com.prestalink.api.publication.PublicationStatus;
import com.prestalink.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RequestRepository extends JpaRepository<ServiceRequest, Long> {

    List<ServiceRequest> findByClient(User client);

    List<ServiceRequest> findByCategory(ServiceCategory category);

    List<ServiceRequest> findByStatus(PublicationStatus status);
}

