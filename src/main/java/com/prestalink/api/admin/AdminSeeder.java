package com.prestalink.api.admin;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminSeeder implements CommandLineRunner {

    private static final String DEFAULT_ADMIN_EMAIL = "waly@prestalink.local";

    private final PrestaLinkAdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        adminRepository.findByEmailIgnoreCase(DEFAULT_ADMIN_EMAIL).orElseGet(() ->
                adminRepository.save(PrestaLinkAdmin.builder()
                        .fullName("Waly Kanoute")
                        .email(DEFAULT_ADMIN_EMAIL)
                        .passwordHash(passwordEncoder.encode("admin123@"))
                        .role("ADMIN")
                        .isActive(true)
                        .build())
        );
    }
}

