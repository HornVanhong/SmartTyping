package com.typemaster.admin;

import com.typemaster.common.error.ResourceNotFoundException;
import com.typemaster.user.User;
import com.typemaster.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class ModerationService {

    private final UserReportRepository userReportRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;

    public ModerationService(
            UserReportRepository userReportRepository,
            AuditLogRepository auditLogRepository,
            UserRepository userRepository,
            AuditService auditService) {
        this.userReportRepository = userReportRepository;
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    public UserReportResponse createReport(CreateReportRequest req, UUID reporterUserId) {
        User reporter = userRepository.findById(reporterUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Reporter not found: " + reporterUserId));

        User reported = null;
        if (req.reportedUserId() != null) {
            reported = userRepository.findById(req.reportedUserId()).orElse(null);
        }

        UserReport report = new UserReport(reporter, reported, req.roomId(), req.category(), req.details());
        UserReport saved = userReportRepository.save(report);

        return UserReportResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<UserReportResponse> listReports(String status, Pageable pageable) {
        Page<UserReport> page;
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            page = userReportRepository.findAllByStatusOrderByCreatedAtDesc(status.toUpperCase(), pageable);
        } else {
            page = userReportRepository.findAllByOrderByCreatedAtDesc(pageable);
        }
        return page.map(UserReportResponse::fromEntity);
    }

    public UserReportResponse updateReportStatus(UUID reportId, UpdateReportStatusRequest req, UUID moderatorUserId) {
        UserReport report = userReportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found: " + reportId));

        report.setStatus(req.status().toUpperCase());
        report.setReviewedBy(moderatorUserId);
        report.setReviewedAt(Instant.now());

        UserReport saved = userReportRepository.save(report);

        auditService.logAction(
                moderatorUserId,
                "REPORT_STATUS_UPDATED",
                "USER_REPORT",
                saved.getId(),
                "{\"status\":\"" + saved.getStatus() + "\"}"
        );

        return UserReportResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<AuditLogResponse> listAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(AuditLogResponse::fromEntity);
    }
}
