package com.typemaster.typing;

import com.typemaster.achievement.AchievementService;
import com.typemaster.common.error.BadRequestException;
import com.typemaster.common.error.ResourceNotFoundException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class TypingSessionService {

    private final TypingSessionRepository typingSessionRepository;
    private final AchievementService achievementService;

    public TypingSessionService(
            TypingSessionRepository typingSessionRepository,
            AchievementService achievementService) {
        this.typingSessionRepository = typingSessionRepository;
        this.achievementService = achievementService;
    }

    public TypingSessionResponse processAndSaveSession(TypingSessionSubmitRequest req, UUID userId) {
        if (req.correctCharacters() > req.totalCharacters()) {
            throw new BadRequestException("Correct characters cannot exceed total characters.");
        }
        if (req.correctCharacters() + req.incorrectCharacters() > req.totalCharacters() + 10) {
            throw new BadRequestException("Character counts are inconsistent.");
        }

        double elapsedMinutes = req.elapsedMs() / 60000.0;
        if (elapsedMinutes <= 0.0) {
            throw new BadRequestException("Elapsed time must be greater than zero.");
        }

        // Server-side recomputation
        double serverCpmVal = req.correctCharacters() / elapsedMinutes;
        BigDecimal serverCpm = BigDecimal.valueOf(serverCpmVal).setScale(2, RoundingMode.HALF_UP);

        BigDecimal serverWpm = null;
        if ("en".equalsIgnoreCase(req.locale())) {
            double serverWpmVal = (req.correctCharacters() / 5.0) / elapsedMinutes;
            serverWpm = BigDecimal.valueOf(serverWpmVal).setScale(2, RoundingMode.HALF_UP);
        }

        double serverAccuracyVal = req.totalCharacters() > 0
                ? (req.correctCharacters() * 100.0 / req.totalCharacters())
                : 0.0;
        BigDecimal serverAccuracy = BigDecimal.valueOf(serverAccuracyVal).setScale(2, RoundingMode.HALF_UP);

        // Calculate ranked eligibility:
        // 1. Must be at least 5 seconds long
        // 2. Realistic speed limits (< 1250 CPM, equivalent to 250 WPM)
        // 3. Realistic accuracy (>= 60%)
        // 4. Elapsed time reasonably matches configured duration (elapsedMs <= durationSeconds * 1000 + 4000)
        boolean rankedEligible = (userId != null)
                && (req.elapsedMs() >= 5000)
                && (serverCpmVal <= 1250.0)
                && (serverAccuracyVal >= 60.0 && serverAccuracyVal <= 100.0)
                && (req.elapsedMs() <= (long) req.durationSeconds() * 1000 + 5000);

        TypingSession session = new TypingSession();
        session.setUserId(userId);
        session.setPassageId(req.passageId());
        session.setLocale(req.locale().toLowerCase());
        session.setMode(req.mode());
        session.setDurationSeconds(req.durationSeconds());
        session.setElapsedMs(req.elapsedMs());
        session.setCorrectCharacters(req.correctCharacters());
        session.setIncorrectCharacters(req.incorrectCharacters());
        session.setTotalCharacters(req.totalCharacters());
        session.setAccuracy(serverAccuracy);
        session.setCpm(serverCpm);
        session.setWpm(serverWpm);
        session.setRawWpm(serverWpm);
        session.setCompleted(true);
        session.setRankedEligible(rankedEligible);
        session.setCreatedAt(Instant.now());

        TypingSession saved = typingSessionRepository.save(session);

        if (userId != null) {
            long totalCount = typingSessionRepository.countByUserIdAndCompletedTrue(userId);
            achievementService.evaluateAndAwardAchievements(userId, saved, totalCount);
        }

        return TypingSessionResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public Page<TypingSessionResponse> getUserHistory(UUID userId, int page, int size) {
        int boundedSize = Math.min(Math.max(size, 1), 100);
        int boundedPage = Math.max(page, 0);
        Pageable pageable = PageRequest.of(boundedPage, boundedSize);
        return typingSessionRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
                .map(TypingSessionResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public TypingSessionResponse getUserSessionById(UUID id, UUID userId) {
        TypingSession session = typingSessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Typing session not found with ID: " + id));
        return TypingSessionResponse.fromEntity(session);
    }

    public void deleteUserSession(UUID id, UUID userId) {
        TypingSession session = typingSessionRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Typing session not found with ID: " + id));
        typingSessionRepository.delete(session);
    }
}
