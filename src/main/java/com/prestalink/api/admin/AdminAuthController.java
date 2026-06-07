package com.prestalink.api.admin;

import com.prestalink.api.recovery.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AdminAuthService adminAuthService;
    private final AccountRecoveryService accountRecoveryService;

    @PostMapping("/login")
    public AdminLoginResponse login(@RequestBody AdminLoginRequest request) {
        return adminAuthService.login(request);
    }

    @GetMapping("/me")
    public AdminSummary me(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        return AdminSummary.from(adminAuthService.requireAdmin(authorization, adminToken));
    }

    @PostMapping("/logout")
    public void logout(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAuthService.logout(authorization, adminToken);
    }

    @PostMapping("/forgot-password")
    public RecoveryResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return accountRecoveryService.forgotPassword(AccountType.ADMIN, request);
    }

    @PostMapping("/reset-password")
    public RecoveryResponse resetPassword(@RequestBody ResetPasswordRequest request) {
        return accountRecoveryService.resetPassword(AccountType.ADMIN, request);
    }

    @PostMapping("/find-email")
    public RecoveryResponse findEmail(@RequestBody FindEmailRequest request) {
        return accountRecoveryService.findEmail(AccountType.ADMIN, request);
    }
}

