package com.prestalink.api.moderation;

import lombok.Data;

@Data
public class ModerationReportRequest {
    private ReportTargetType targetType;
    private ReportReason reason;
    private Long reportedUserId;
    private String publicationType;
    private Long publicationId;
    private String details;
}

