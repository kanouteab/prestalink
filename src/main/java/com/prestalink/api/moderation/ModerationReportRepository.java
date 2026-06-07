package com.prestalink.api.moderation;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ModerationReportRepository extends JpaRepository<ModerationReport, Long> {
}

