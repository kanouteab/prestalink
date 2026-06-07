package com.prestalink.api.moderation;

import com.prestalink.api.user.User;
import com.prestalink.api.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class ModerationReportService {

    private final ModerationReportRepository moderationReportRepository;
    private final UserRepository userRepository;

    public ModerationReportResponse createReport(Long currentUserId, ModerationReportRequest request) {
        if (currentUserId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Connectez-vous pour signaler ce contenu.");
        }

        if (request.getTargetType() == null || request.getReason() == null) {
            throw new RuntimeException("Le type de signalement et le motif sont obligatoires.");
        }

        User reporter = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Connectez-vous pour signaler ce contenu."));

        User reportedUser = null;

        if (request.getReportedUserId() != null) {
            if (request.getReportedUserId().equals(currentUserId)) {
                throw new RuntimeException("Vous ne pouvez pas vous signaler vous-même.");
            }

            reportedUser = userRepository.findById(request.getReportedUserId())
                    .orElseThrow(() -> new RuntimeException("Utilisateur signalé introuvable"));
        }

        validateTarget(request);

        ModerationReport report = ModerationReport.builder()
                .targetType(request.getTargetType())
                .reason(request.getReason())
                .reasonLabel(reasonLabel(request.getReason()))
                .publicationType(request.getPublicationType())
                .publicationId(request.getPublicationId())
                .details(request.getDetails())
                .reporter(reporter)
                .reportedUser(reportedUser)
                .build();

        return toResponse(moderationReportRepository.save(report));
    }

    private void validateTarget(ModerationReportRequest request) {
        if (request.getTargetType() == ReportTargetType.USER && request.getReportedUserId() == null) {
            throw new RuntimeException("Utilisateur à signaler manquant.");
        }

        if (request.getTargetType() == ReportTargetType.PUBLICATION
                && (request.getPublicationType() == null || request.getPublicationId() == null)) {
            throw new RuntimeException("Publication à signaler manquante.");
        }
    }

    private String reasonLabel(ReportReason reason) {
        return switch (reason) {
            case SPAM -> "Spam";
            case SCAM -> "Arnaque";
            case INAPPROPRIATE_CONTENT -> "Contenu inapproprié";
        };
    }

    private ModerationReportResponse toResponse(ModerationReport report) {
        return ModerationReportResponse.builder()
                .id(report.getId())
                .targetType(report.getTargetType())
                .reason(report.getReason())
                .reasonLabel(report.getReasonLabel())
                .reporterId(report.getReporter().getId())
                .reportedUserId(report.getReportedUser() != null ? report.getReportedUser().getId() : null)
                .publicationType(report.getPublicationType())
                .publicationId(report.getPublicationId())
                .details(report.getDetails())
                .createdAt(report.getCreatedAt())
                .build();
    }
}

