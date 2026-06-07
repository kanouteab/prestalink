package com.prestalink.api.history;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
public class ServiceHistoryController {

    private final ServiceHistoryService historyService;

    @GetMapping("/me")
    public ServiceHistoryResponse getMyHistory(
            @RequestHeader(value = "X-Current-User-Id", required = false) Long currentUserId
    ) {
        return historyService.getMyHistory(currentUserId);
    }

    @GetMapping("/user/{userId}")
    public ServiceHistoryResponse getUserHistory(@PathVariable Long userId) {
        return historyService.getUserHistory(userId);
    }

    @PutMapping("/{id}/status")
    public ServiceHistoryItemResponse updateStatus(
            @PathVariable Long id,
            @RequestBody HistoryStatusUpdateRequest request
    ) {
        return historyService.updateStatus(id, request.getStatus());
    }
}

