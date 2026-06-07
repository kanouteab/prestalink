package com.prestalink.api.auth;

import com.prestalink.api.user.UserResponse;
import com.prestalink.api.recovery.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final VerificationService verificationService;
    private final AccountRecoveryService accountRecoveryService;

    @PostMapping("/register")
    public UserResponse register(@RequestBody RegisterRequest request) {
        return authService.register(request).getUser();
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        try {
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail(request.getEmail());
            loginRequest.setPassword(request.getPassword());
            return ResponseEntity.ok(authService.login(loginRequest).getUser());
        } catch (RuntimeException error) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Email ou mot de passe incorrect."));
        }
    }

    @PostMapping("/send-verification-email")
    public VerificationMessageResponse sendVerificationEmail(@RequestBody EmailVerificationRequest request) {
        return verificationService.sendVerificationEmail(request);
    }

    @GetMapping("/verify-email")
    public VerificationMessageResponse verifyEmail(@RequestParam String token) {
        return verificationService.verifyEmail(token);
    }

    @PostMapping("/send-phone-verification-code")
    public VerificationMessageResponse sendPhoneVerificationCode(@RequestBody PhoneVerificationRequest request) {
        return verificationService.sendPhoneVerificationCode(request);
    }

    @PostMapping("/verify-phone")
    public VerificationMessageResponse verifyPhone(@RequestBody PhoneCodeVerificationRequest request) {
        return verificationService.verifyPhone(request);
    }

    @PostMapping("/forgot-password")
    public RecoveryResponse forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return accountRecoveryService.forgotPassword(AccountType.USER, request);
    }

    @PostMapping("/reset-password")
    public RecoveryResponse resetPassword(@RequestBody ResetPasswordRequest request) {
        return accountRecoveryService.resetPassword(AccountType.USER, request);
    }

    @PostMapping("/find-email")
    public RecoveryResponse findEmail(@RequestBody FindEmailRequest request) {
        return accountRecoveryService.findEmail(AccountType.USER, request);
    }
}

