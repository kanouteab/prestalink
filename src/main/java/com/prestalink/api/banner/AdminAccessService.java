package com.prestalink.api.banner;

import com.prestalink.api.admin.AdminAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminAccessService {

    private final AdminAuthService adminAuthService;

    public void requireAdmin(String authorizationHeader, String adminTokenHeader) {
        adminAuthService.requireAdmin(authorizationHeader, adminTokenHeader);
    }
}

