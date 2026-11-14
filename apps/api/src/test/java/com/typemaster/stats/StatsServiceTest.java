package com.typemaster.stats;

import com.typemaster.typing.TypingSession;
import com.typemaster.typing.TypingSessionRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class StatsServiceTest {

    @Mock
    private TypingSessionRepository sessionRepository;

    @InjectMocks
    private StatsService statsService;

    @Test
    @DisplayName("Aggregates user summary stats correctly")
    void aggregatesUserSummaryStats() {
        UUID userId = UUID.randomUUID();

        when(sessionRepository.countByUserIdAndCompletedTrue(userId)).thenReturn(15L);
        when(sessionRepository.findMaxWpmByUserId(userId)).thenReturn(Optional.of(BigDecimal.valueOf(82.50)));
        when(sessionRepository.findMaxCpmByUserId(userId)).thenReturn(Optional.of(BigDecimal.valueOf(412.50)));
        when(sessionRepository.findAverageAccuracyByUserId(userId)).thenReturn(Optional.of(97.85));
        when(sessionRepository.findTotalElapsedMsByUserId(userId)).thenReturn(Optional.of(450000L)); // 450 seconds

        UserSummaryStatsResponse summary = statsService.getUserSummary(userId);

        assertThat(summary.totalTestsCompleted()).isEqualTo(15L);
        assertThat(summary.bestWpm()).isEqualByComparingTo("82.50");
        assertThat(summary.bestCpm()).isEqualByComparingTo("412.50");
        assertThat(summary.averageAccuracy()).isEqualByComparingTo("97.85");
        assertThat(summary.totalPracticeTimeSeconds()).isEqualTo(450L);
    }

    @Test
    @DisplayName("Returns chronological trend points with locale filter")
    void returnsChronologicalTrendPoints() {
        UUID userId = UUID.randomUUID();

        TypingSession s1 = new TypingSession();
        s1.setId(UUID.randomUUID());
        s1.setLocale("km");
        s1.setMode("TIME_30");
        s1.setDurationSeconds(30);
        s1.setCpm(BigDecimal.valueOf(250));
        s1.setAccuracy(BigDecimal.valueOf(98.0));
        s1.setCreatedAt(Instant.parse("2026-11-14T01:00:00Z"));

        TypingSession s2 = new TypingSession();
        s2.setId(UUID.randomUUID());
        s2.setLocale("km");
        s2.setMode("TIME_30");
        s2.setDurationSeconds(30);
        s2.setCpm(BigDecimal.valueOf(280));
        s2.setAccuracy(BigDecimal.valueOf(99.0));
        s2.setCreatedAt(Instant.parse("2026-11-14T02:00:00Z"));

        // Repository returns desc (newest first)
        when(sessionRepository.findTop50ByUserIdAndLocaleOrderByCreatedAtDesc(userId, "km"))
                .thenReturn(List.of(s2, s1));

        List<TrendPointResponse> trend = statsService.getUserTrend(userId, "km", 10);

        // Service reverses to chronological order (oldest first for charting)
        assertThat(trend).hasSize(2);
        assertThat(trend.get(0).cpm()).isEqualByComparingTo("250.00");
        assertThat(trend.get(1).cpm()).isEqualByComparingTo("280.00");
    }
}
