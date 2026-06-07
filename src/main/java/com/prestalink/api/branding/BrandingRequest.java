package com.prestalink.api.branding;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BrandingRequest {
    private String faviconUrl;
    private String sidebarLogoUrl;
    private String loginLogoUrl;
    private String primaryColor;
    private String secondaryColor;
    private String slogan;
    private Boolean isActive;
}

