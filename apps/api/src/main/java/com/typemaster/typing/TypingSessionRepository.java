package com.typemaster.typing;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TypingSessionRepository extends JpaRepository<TypingSession, UUID> {

    Page<TypingSession> findByUserIdOrderByCreatedAtDesc(UUID userId, Pageable pageable);

    Optional<TypingSession> findByIdAndUserId(UUID id, UUID userId);

    long countByUserIdAndCompletedTrue(UUID userId);

    @Query("SELECT MAX(s.wpm) FROM TypingSession s WHERE s.userId = :userId AND s.completed = true")
    Optional<BigDecimal> findMaxWpmByUserId(@Param("userId") UUID userId);

    @Query("SELECT MAX(s.cpm) FROM TypingSession s WHERE s.userId = :userId AND s.completed = true")
    Optional<BigDecimal> findMaxCpmByUserId(@Param("userId") UUID userId);

    @Query("SELECT AVG(s.accuracy) FROM TypingSession s WHERE s.userId = :userId AND s.completed = true")
    Optional<Double> findAverageAccuracyByUserId(@Param("userId") UUID userId);

    @Query("SELECT SUM(s.elapsedMs) FROM TypingSession s WHERE s.userId = :userId AND s.completed = true")
    Optional<Long> findTotalElapsedMsByUserId(@Param("userId") UUID userId);

    List<TypingSession> findTop50ByUserIdOrderByCreatedAtDesc(UUID userId);

    List<TypingSession> findTop50ByUserIdAndLocaleOrderByCreatedAtDesc(UUID userId, String locale);

    @Query("SELECT s FROM TypingSession s WHERE s.rankedEligible = true AND s.locale = 'en' AND (:mode IS NULL OR s.mode = :mode) AND s.createdAt >= :since ORDER BY s.wpm DESC NULLS LAST, s.accuracy DESC, s.createdAt ASC")
    Page<TypingSession> findRankedEnglishSessions(
            @Param("mode") String mode,
            @Param("since") Instant since,
            Pageable pageable
    );

    @Query("SELECT s FROM TypingSession s WHERE s.rankedEligible = true AND s.locale = 'km' AND (:mode IS NULL OR s.mode = :mode) AND s.createdAt >= :since ORDER BY s.cpm DESC, s.accuracy DESC, s.createdAt ASC")
    Page<TypingSession> findRankedKhmerSessions(
            @Param("mode") String mode,
            @Param("since") Instant since,
            Pageable pageable
    );
}
