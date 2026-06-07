package com.prestalink.api.moderation;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ModerationReportResponse {
    private Long id;
    private ReportTargetType targetType;
    private ReportReason reason;
    private String reasonLabel;
    private Long reporterId;
    private Long reportedUserId;
    private String publicationType;
    private Long publicationId;
    private String details;
    private LocalDateTime createdAt;
}

