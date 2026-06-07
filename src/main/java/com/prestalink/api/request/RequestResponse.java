package com.prestalink.api.request;

import com.prestalink.api.category.ServiceCategory;
import com.prestalink.api.publication.PublicationStatus;
import com.prestalink.api.user.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class RequestResponse {
    private Long id;
    private String title;
    private String description;
    private Double budget;
    private String location;
    private String locationLabel;
    private Double latitude;
    private Double longitude;
    private PublicationStatus status;
    private LocalDateTime createdAt;
    private UserResponse client;
    private ServiceCategory category;
    private List<String> photoUrls;
}

