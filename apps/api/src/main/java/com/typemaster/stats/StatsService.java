package com.typemaster.stats;

import com.typemaster.typing.TypingSession;
import com.typemaster.typing.TypingSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class StatsService {

    private final TypingSessionRepository sessionRepository;

    public StatsService(TypingSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    public UserSummaryStatsResponse getUserSummary(UUID userId) {
        long totalCompleted = sessionRepository.countByUserIdAndCompletedTrue(userId);
        BigDecimal bestWpm = sessionRepository.findMaxWpmByUserId(userId).orElse(BigDecimal.ZERO);
        BigDecimal bestCpm = sessionRepository.findMaxCpmByUserId(userId).orElse(BigDecimal.ZERO);

        Double avgAccuracyVal = sessionRepository.findAverageAccuracyByUserId(userId).orElse(0.0);
        BigDecimal avgAccuracy = BigDecimal.valueOf(avgAccuracyVal).setScale(2, RoundingMode.HALF_UP);

        long totalElapsedMs = sessionRepository.findTotalElapsedMsByUserId(userId).orElse(0L);
        long totalPracticeTimeSeconds = totalElapsedMs / 1000;

        return new UserSummaryStatsResponse(
                totalCompleted,
                bestWpm,
                bestCpm,
                avgAccuracy,
                totalPracticeTimeSeconds
        );
    }

    public List<TrendPointResponse> getUserTrend(UUID userId, String locale, int limit) {
        int boundedLimit = Math.min(Math.max(limit, 5), 50);

        List<TypingSession> sessions;
        if (locale != null && !locale.isBlank()) {
            sessions = sessionRepository.findTop50ByUserIdAndLocaleOrderByCreatedAtDesc(userId, locale.toLowerCase());
        } else {
            sessions = sessionRepository.findTop50ByUserIdOrderByCreatedAtDesc(userId);
        }

        if (sessions.size() > boundedLimit) {
            sessions = sessions.subList(0, boundedLimit);
        }

        // Return chronologically for charts (oldest to newest)
        List<TypingSession> chronological = new java.util.ArrayList<>(sessions);
        Collections.reverse(chronological);

        return chronological.stream().map(s -> new TrendPointResponse(
                s.getId(),
                s.getLocale(),
                s.getMode(),
                s.getDurationSeconds(),
                s.getCpm(),
                s.getWpm(),
                s.getAccuracy(),
                s.getCreatedAt()
        )).toList();
    }
}
