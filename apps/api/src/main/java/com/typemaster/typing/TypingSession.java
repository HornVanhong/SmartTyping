package com.typemaster.typing;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "typing_sessions")
public class TypingSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "passage_id")
    private UUID passageId;

    @Column(nullable = false, length = 5)
    private String locale;

    @Column(nullable = false, length = 30)
    private String mode;

    @Column(name = "duration_seconds", nullable = false)
    private int durationSeconds;

    @Column(name = "elapsed_ms", nullable = false)
    private long elapsedMs;

    @Column(name = "correct_characters", nullable = false)
    private int correctCharacters;

    @Column(name = "incorrect_characters", nullable = false)
    private int incorrectCharacters;

    @Column(name = "total_characters", nullable = false)
    private int totalCharacters;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal accuracy;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal cpm;

    @Column(precision = 10, scale = 2)
    private BigDecimal wpm;

    @Column(name = "raw_wpm", precision = 10, scale = 2)
    private BigDecimal rawWpm;

    @Column(nullable = false)
    private boolean completed = true;

    @Column(name = "ranked_eligible", nullable = false)
    private boolean rankedEligible = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public TypingSession() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getPassageId() { return passageId; }
    public void setPassageId(UUID passageId) { this.passageId = passageId; }

    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }

    public String getMode() { return mode; }
    public void setMode(String mode) { this.mode = mode; }

    public int getDurationSeconds() { return durationSeconds; }
    public void setDurationSeconds(int durationSeconds) { this.durationSeconds = durationSeconds; }

    public long getElapsedMs() { return elapsedMs; }
    public void setElapsedMs(long elapsedMs) { this.elapsedMs = elapsedMs; }

    public int getCorrectCharacters() { return correctCharacters; }
    public void setCorrectCharacters(int correctCharacters) { this.correctCharacters = correctCharacters; }

    public int getIncorrectCharacters() { return incorrectCharacters; }
    public void setIncorrectCharacters(int incorrectCharacters) { this.incorrectCharacters = incorrectCharacters; }

    public int getTotalCharacters() { return totalCharacters; }
    public void setTotalCharacters(int totalCharacters) { this.totalCharacters = totalCharacters; }

    public BigDecimal getAccuracy() { return accuracy; }
    public void setAccuracy(BigDecimal accuracy) { this.accuracy = accuracy; }

    public BigDecimal getCpm() { return cpm; }
    public void setCpm(BigDecimal cpm) { this.cpm = cpm; }

    public BigDecimal getWpm() { return wpm; }
    public void setWpm(BigDecimal wpm) { this.wpm = wpm; }

    public BigDecimal getRawWpm() { return rawWpm; }
    public void setRawWpm(BigDecimal rawWpm) { this.rawWpm = rawWpm; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public boolean isRankedEligible() { return rankedEligible; }
    public void setRankedEligible(boolean rankedEligible) { this.rankedEligible = rankedEligible; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
