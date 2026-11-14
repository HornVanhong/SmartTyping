package com.typemaster.admin;

import com.typemaster.user.User;
import com.typemaster.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModerationServiceTest {

    @Mock
    private UserReportRepository userReportRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private ModerationService moderationService;

    private User reporter;
    private User reported;
    private UUID moderatorId;

    @BeforeEach
    void setUp() {
        reporter = new User("reporter@typemaster.kh", "hash", "ReporterUser", "en");
        reporter.setId(UUID.randomUUID());

        reported = new User("offender@typemaster.kh", "hash", "OffenderUser", "en");
        reported.setId(UUID.randomUUID());

        moderatorId = UUID.randomUUID();
    }

    @Test
    void createReport_savesReportSuccessfully() {
        CreateReportRequest req = new CreateReportRequest(
                reported.getId(),
                null,
                "INAPPROPRIATE_NAME",
                "Username violates community standards."
        );

        when(userRepository.findById(reporter.getId())).thenReturn(Optional.of(reporter));
        when(userRepository.findById(reported.getId())).thenReturn(Optional.of(reported));
        when(userReportRepository.save(any(UserReport.class))).thenAnswer(inv -> {
            UserReport r = inv.getArgument(0);
            r.setId(UUID.randomUUID());
            return r;
        });

        UserReportResponse response = moderationService.createReport(req, reporter.getId());

        assertThat(response).isNotNull();
        assertThat(response.category()).isEqualTo("INAPPROPRIATE_NAME");
        assertThat(response.reporterDisplayName()).isEqualTo("ReporterUser");
        assertThat(response.reportedDisplayName()).isEqualTo("OffenderUser");
        assertThat(response.status()).isEqualTo("OPEN");
    }

    @Test
    void updateReportStatus_updatesStatusAndLogsAudit() {
        UUID reportId = UUID.randomUUID();
        UserReport existing = new UserReport(reporter, reported, null, "SPAM", "Suspicious spammer");
        existing.setId(reportId);

        when(userReportRepository.findById(reportId)).thenReturn(Optional.of(existing));
        when(userReportRepository.save(any(UserReport.class))).thenAnswer(inv -> inv.getArgument(0));

        UpdateReportStatusRequest req = new UpdateReportStatusRequest("RESOLVED");
        UserReportResponse response = moderationService.updateReportStatus(reportId, req, moderatorId);

        assertThat(response.status()).isEqualTo("RESOLVED");
        assertThat(response.reviewedBy()).isEqualTo(moderatorId);

        verify(auditService, times(1)).logAction(
                eq(moderatorId),
                eq("REPORT_STATUS_UPDATED"),
                eq("USER_REPORT"),
                eq(reportId),
                contains("RESOLVED")
        );
    }

    @Test
    void listReports_returnsPagedReports() {
        UserReport r1 = new UserReport(reporter, reported, null, "OFFENSIVE", "Bad content");
        r1.setId(UUID.randomUUID());

        when(userReportRepository.findAllByStatusOrderByCreatedAtDesc(eq("OPEN"), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(r1)));

        Page<UserReportResponse> page = moderationService.listReports("OPEN", PageRequest.of(0, 10));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).category()).isEqualTo("OFFENSIVE");
    }
}
