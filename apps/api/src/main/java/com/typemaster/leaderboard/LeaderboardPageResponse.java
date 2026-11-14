package com.typemaster.leaderboard;

import java.util.List;

public record LeaderboardPageResponse(
        String period,
        String locale,
        String mode,
        List<LeaderboardItemResponse> items,
        int page,
        int size,
        long totalItems
) {}
