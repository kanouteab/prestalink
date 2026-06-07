package com.prestalink.api.mission;

import com.prestalink.api.request.RequestResponse;
import com.prestalink.api.user.UserResponse;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class MissionResponse {
    private Long id;
    private MissionStatus status;
    private LocalDateTime startedAt;
    private LocalDateTime finishedAt;
    private UserResponse client;
    private UserResponse provider;
    private RequestResponse request;
}
