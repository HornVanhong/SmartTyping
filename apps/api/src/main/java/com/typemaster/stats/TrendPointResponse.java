package com.typemaster.stats;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TrendPointResponse(
        UUID id,
        String locale,
        String mode,
        int durationSeconds,
        BigDecimal cpm,
        BigDecimal wpm,
        BigDecimal accuracy,
        Instant createdAt
) {}
