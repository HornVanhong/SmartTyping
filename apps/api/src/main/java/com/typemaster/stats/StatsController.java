package com.typemaster.stats;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/stats")
public class StatsController {

    private final StatsService statsService;

    public StatsController(StatsService statsService) {
        this.statsService = statsService;
    }

    @GetMapping("/me/summary")
    public ResponseEntity<UserSummaryStatsResponse> getMySummary(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(statsService.getUserSummary(userId));
    }

    @GetMapping("/me/trend")
    public ResponseEntity<List<TrendPointResponse>> getMyTrend(
            Authentication authentication,
            @RequestParam(required = false) String locale,
            @RequestParam(defaultValue = "30") int limit) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(statsService.getUserTrend(userId, locale, limit));
    }
}
