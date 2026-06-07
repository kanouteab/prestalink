package com.prestalink.api.mission;

import com.prestalink.api.request.ServiceRequest;
import com.prestalink.api.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MissionRepository extends JpaRepository<Mission, Long> {

    List<Mission> findByClient(User client);

    List<Mission> findByProvider(User provider);

    List<Mission> findByRequest(ServiceRequest request);

    List<Mission> findByStatus(MissionStatus status);

    long countByProviderAndStatus(User provider, MissionStatus status);
}

