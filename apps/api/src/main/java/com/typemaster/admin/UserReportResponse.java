package com.typemaster.admin;

import java.time.Instant;
import java.util.UUID;

public record UserReportResponse(
        UUID id,
        UUID reporterUserId,
        String reporterDisplayName,
        UUID reportedUserId,
        String reportedDisplayName,
        UUID roomId,
        String category,
        String details,
        String status,
        UUID reviewedBy,
        Instant createdAt,
        Instant reviewedAt
) {
    public static UserReportResponse fromEntity(UserReport report) {
        return new UserReportResponse(
                report.getId(),
                report.getReporterUser() != null ? report.getReporterUser().getId() : null,
                report.getReporterUser() != null ? report.getReporterUser().getDisplayName() : "Unknown",
                report.getReportedUser() != null ? report.getReportedUser().getId() : null,
                report.getReportedUser() != null ? report.getReportedUser().getDisplayName() : null,
                report.getRoomId(),
                report.getCategory(),
                report.getDetails(),
                report.getStatus(),
                report.getReviewedBy(),
                report.getCreatedAt(),
                report.getReviewedAt()
        );
    }
}
