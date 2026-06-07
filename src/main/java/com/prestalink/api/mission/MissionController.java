package com.prestalink.api.mission;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/missions")
@RequiredArgsConstructor
public class MissionController {

    private final MissionService missionService;

    @PostMapping
    public MissionResponse createMission(
            @RequestParam Long clientId,
            @RequestParam Long providerId,
            @RequestParam Long requestId
    ) {
        return missionService.createMission(clientId, providerId, requestId);
    }

    @PutMapping("/{missionId}/cancel")
    public MissionResponse cancelMission(@PathVariable Long missionId) {
        return missionService.cancelMission(missionId);
    }

    @PutMapping("/{missionId}/finish")
    public MissionResponse finishMission(@PathVariable Long missionId) {
        return missionService.finishMission(missionId);
    }

    @GetMapping
    public List<MissionResponse> getAllMissions() {
        return missionService.getAllMissions();
    }

    @GetMapping("/active")
    public List<MissionResponse> getActiveMissions() {
        return missionService.getActiveMissions();
    }
}
