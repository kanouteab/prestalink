package com.prestalink.api.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
public class SecurityConfig {

    @Value("${app.cors.allowed-origin-patterns}")
    private String allowedOriginPatterns;

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> {})
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/users/**",
                                "/api/dashboard/**",
                                "/api/missions/**",
                                "/api/requests/**",
                                "/api/offers/**",
                                "/api/favorites/**",
                                "/api/history/**",
                                "/api/notifications/**",
                                "/api/chat/**",
                                "/api/messages/**",
                                "/uploads/**",
                                "/ws-prestalink/**"
                        ).permitAll()
                        .anyRequest().permitAll()
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(parseCsv(allowedOriginPatterns));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Location"));
        configuration.setAllowCredentials(false);

        // Le handshake SockJS (/ws-prestalink/info, .../xhr_streaming, ...) est
        // envoye par le navigateur avec `withCredentials: true` ; sans
        // Access-Control-Allow-Credentials: true en reponse, le navigateur
        // bloque la negociation et le chat/notifications temps reel ne se
        // connectent jamais. La config CORS ci-dessus (allowCredentials=false,
        // partagee par le reste de l'API) ecrasait sinon celle, plus permissive,
        // deja definie sur l'endpoint STOMP lui-meme (WebSocketConfig).
        CorsConfiguration webSocketConfiguration = new CorsConfiguration();
        webSocketConfiguration.setAllowedOriginPatterns(parseCsv(allowedOriginPatterns));
        webSocketConfiguration.setAllowedMethods(List.of("GET", "POST", "OPTIONS"));
        webSocketConfiguration.setAllowedHeaders(List.of("*"));
        webSocketConfiguration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/ws-prestalink/**", webSocketConfiguration);
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    private List<String> parseCsv(String value) {
        return Arrays.stream(value.split(","))
                .map(String::trim)
                .filter(item -> !item.isBlank())
                .toList();
    }
}

