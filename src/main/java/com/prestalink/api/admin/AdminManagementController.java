package com.prestalink.api.admin;

import com.prestalink.api.moderation.ModerationReport;
import com.prestalink.api.moderation.ModerationReportRepository;
import com.prestalink.api.offer.OfferRepository;
import com.prestalink.api.offer.ServiceOffer;
import com.prestalink.api.request.RequestRepository;
import com.prestalink.api.request.ServiceRequest;
import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminManagementController {

    private final AdminAuthService adminAuthService;
    private final UserRepository userRepository;
    private final OfferRepository offerRepository;
    private final RequestRepository requestRepository;
    private final ModerationReportRepository reportRepository;

    @GetMapping("/users")
    public List<Map<String, Object>> users(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAuthService.requireAdmin(authorization, adminToken);
        return userRepository.findAll().stream().map(this::userRow).toList();
    }

    @GetMapping("/publications")
    public List<Map<String, Object>> publications(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAuthService.requireAdmin(authorization, adminToken);
        List<Map<String, Object>> rows = new ArrayList<>();
        offerRepository.findAll().forEach(offer -> rows.add(offerRow(offer)));
        requestRepository.findAll().forEach(request -> rows.add(requestRow(request)));
        return rows;
    }

    @GetMapping("/reports")
    public List<Map<String, Object>> reports(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAuthService.requireAdmin(authorization, adminToken);
        return reportRepository.findAll().stream().map(this::reportRow).toList();
    }

    @GetMapping("/stats")
    public Map<String, Object> stats(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestHeader(value = "X-Admin-Token", required = false) String adminToken
    ) {
        adminAuthService.requireAdmin(authorization, adminToken);
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("users", userRepository.count());
        stats.put("offers", offerRepository.count());
        stats.put("requests", requestRepository.count());
        stats.put("reports", reportRepository.count());
        stats.put("publications", offerRepository.count() + requestRepository.count());
        return stats;
    }

    private Map<String, Object> userRow(User user) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", user.getId());
        row.put("fullName", user.getFullName());
        row.put("email", user.getEmail());
        row.put("role", user.getRole());
        row.put("accountStatus", user.getAccountStatus());
        row.put("createdAt", user.getCreatedAt());
        return row;
    }

    private Map<String, Object> offerRow(ServiceOffer offer) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", offer.getId());
        row.put("type", "OFFRE");
        row.put("title", offer.getTitle());
        row.put("status", offer.getStatus());
        row.put("author", offer.getProvider() != null ? offer.getProvider().getFullName() : "");
        row.put("createdAt", offer.getCreatedAt());
        return row;
    }

    private Map<String, Object> requestRow(ServiceRequest request) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", request.getId());
        row.put("type", "DEMANDE");
        row.put("title", request.getTitle());
        row.put("status", request.getStatus());
        row.put("author", request.getClient() != null ? request.getClient().getFullName() : "");
        row.put("createdAt", request.getCreatedAt());
        return row;
    }

    private Map<String, Object> reportRow(ModerationReport report) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", report.getId());
        row.put("targetType", report.getTargetType());
        row.put("reason", report.getReasonLabel());
        row.put("publicationType", report.getPublicationType());
        row.put("publicationId", report.getPublicationId());
        row.put("reporter", report.getReporter() != null ? report.getReporter().getFullName() : "");
        row.put("reportedUser", report.getReportedUser() != null ? report.getReportedUser().getFullName() : "");
        row.put("createdAt", report.getCreatedAt());
        return row;
    }
}

