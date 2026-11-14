package com.typemaster.multiplayer;

import com.typemaster.user.User;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "race_participants")
public class RaceParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private MultiplayerRoom room;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "progress_characters", nullable = false)
    private int progressCharacters = 0;

    @Column(name = "correct_characters", nullable = false)
    private int correctCharacters = 0;

    @Column(name = "incorrect_characters", nullable = false)
    private int incorrectCharacters = 0;

    @Column(name = "finish_elapsed_ms")
    private Long finishElapsedMs;

    @Column(name = "final_cpm", precision = 10, scale = 2)
    private BigDecimal finalCpm;

    @Column(name = "final_wpm", precision = 10, scale = 2)
    private BigDecimal finalWpm;

    private Integer placement;

    @Column(nullable = false, length = 20)
    private String status = "JOINED"; // JOINED, READY, RACING, FINISHED, DISCONNECTED, FORFEITED

    @Column(name = "joined_at", nullable = false, updatable = false)
    private Instant joinedAt = Instant.now();

    public RaceParticipant() {}

    public RaceParticipant(MultiplayerRoom room, User user) {
        this.room = room;
        this.user = user;
        this.status = "JOINED";
        this.joinedAt = Instant.now();
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public MultiplayerRoom getRoom() { return room; }
    public void setRoom(MultiplayerRoom room) { this.room = room; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public int getProgressCharacters() { return progressCharacters; }
    public void setProgressCharacters(int progressCharacters) { this.progressCharacters = progressCharacters; }

    public int getCorrectCharacters() { return correctCharacters; }
    public void setCorrectCharacters(int correctCharacters) { this.correctCharacters = correctCharacters; }

    public int getIncorrectCharacters() { return incorrectCharacters; }
    public void setIncorrectCharacters(int incorrectCharacters) { this.incorrectCharacters = incorrectCharacters; }

    public Long getFinishElapsedMs() { return finishElapsedMs; }
    public void setFinishElapsedMs(Long finishElapsedMs) { this.finishElapsedMs = finishElapsedMs; }

    public BigDecimal getFinalCpm() { return finalCpm; }
    public void setFinalCpm(BigDecimal finalCpm) { this.finalCpm = finalCpm; }

    public BigDecimal getFinalWpm() { return finalWpm; }
    public void setFinalWpm(BigDecimal finalWpm) { this.finalWpm = finalWpm; }

    public Integer getPlacement() { return placement; }
    public void setPlacement(Integer placement) { this.placement = placement; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Instant getJoinedAt() { return joinedAt; }
    public void setJoinedAt(Instant joinedAt) { this.joinedAt = joinedAt; }
}
