package com.prestalink.api.banner;

import lombok.Data;

@Data
public class BannerAdminRequest {
    private String title;
    private String subtitle;
    private String primaryButtonText;
    private String primaryButtonLink;
    private String secondaryButtonText;
    private String secondaryButtonLink;
    private String imageUrl;
    private String feature1;
    private String feature2;
    private String feature3;
    private String feature4;
    private Boolean isActive;
}

