package com.prestalink.api.dashboard;

import lombok.Builder;
import lombok.Data;
import com.prestalink.api.user.UserStatus;

@Data
@Builder
public class DashboardResponse {
    private long totalUsers;
    private long totalClients;
    private long totalProviders;
    private long totalCategories;
    private long totalOffers;
    private long activeOffers;
    private long totalRequests;
    private long pendingRequests;
    private long totalMissions;
    private long activeMissions;
    private long finishedMissions;
    private long availableProviders;
    private long busyProviders;
    private long cancelledMissions;
    private long availableClients;
    private long busyClients;
    private long cancelledRequests;
}
