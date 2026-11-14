package com.typemaster.typing;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TypingSessionResponse(
        UUID id,
        UUID userId,
        UUID passageId,
        String locale,
        String mode,
        int durationSeconds,
        long elapsedMs,
        int correctCharacters,
        int incorrectCharacters,
        int totalCharacters,
        BigDecimal accuracy,
        BigDecimal cpm,
        BigDecimal wpm,
        BigDecimal rawWpm,
        boolean completed,
        boolean rankedEligible,
        Instant createdAt
) {
    public static TypingSessionResponse fromEntity(TypingSession s) {
        return new TypingSessionResponse(
                s.getId(),
                s.getUserId(),
                s.getPassageId(),
                s.getLocale(),
                s.getMode(),
                s.getDurationSeconds(),
                s.getElapsedMs(),
                s.getCorrectCharacters(),
                s.getIncorrectCharacters(),
                s.getTotalCharacters(),
                s.getAccuracy(),
                s.getCpm(),
                s.getWpm(),
                s.getRawWpm(),
                s.isCompleted(),
                s.isRankedEligible(),
                s.getCreatedAt()
        );
    }
}
