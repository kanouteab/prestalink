package com.prestalink.api.request;

import com.prestalink.api.category.ServiceCategory;
import com.prestalink.api.publication.PublicationStatus;
import com.prestalink.api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;

@Entity
@Table(name = "service_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;

    @Column(length = 1000)
    private String description;

    private Double budget;

    private String location;
    private String locationLabel;
    private Double latitude;
    private Double longitude;

    @Enumerated(EnumType.STRING)
    private PublicationStatus status;

    private LocalDateTime createdAt;

    @Builder.Default
    @ElementCollection
    @CollectionTable(name = "service_request_photos", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "photo_url", columnDefinition = "TEXT")
    private List<String> photoUrls = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "client_id")
    private User client;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private ServiceCategory category;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();

        if (status == null) {
            status = PublicationStatus.AVAILABLE;
        }
    }

}

