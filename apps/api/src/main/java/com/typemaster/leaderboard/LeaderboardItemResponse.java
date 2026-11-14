package com.typemaster.leaderboard;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record LeaderboardItemResponse(
        int rank,
        UUID userId,
        String displayName,
        String avatarColor,
        BigDecimal wpm,
        BigDecimal cpm,
        BigDecimal accuracy,
        Instant createdAt
) {}
