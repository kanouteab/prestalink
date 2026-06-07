package com.prestalink.api.moderation;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ModerationReportController {

    private final ModerationReportService moderationReportService;

    @PostMapping
    public ModerationReportResponse createReport(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId,
            @RequestBody ModerationReportRequest request
    ) {
        return moderationReportService.createReport(currentUserId, request);
    }
}

