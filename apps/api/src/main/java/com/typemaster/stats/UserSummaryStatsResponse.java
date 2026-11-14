package com.typemaster.stats;

import java.math.BigDecimal;

public record UserSummaryStatsResponse(
        long totalTestsCompleted,
        BigDecimal bestWpm,
        BigDecimal bestCpm,
        BigDecimal averageAccuracy,
        long totalPracticeTimeSeconds
) {}
