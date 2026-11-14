package com.typemaster.multiplayer;

import com.typemaster.content.Passage;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "multiplayer_rooms")
public class MultiplayerRoom {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "room_code", nullable = false, unique = true, length = 10)
    private String roomCode;

    @Column(name = "host_user_id", nullable = false)
    private UUID hostUserId;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "passage_id", nullable = false)
    private Passage passage;

    @Column(nullable = false, length = 5)
    private String locale;

    @Column(nullable = false, length = 20)
    private String status = "WAITING"; // WAITING, READY, COUNTDOWN, RACING, COMPLETED, CANCELLED

    @Column(name = "is_private", nullable = false)
    private boolean isPrivate = true;

    @Column(name = "max_players", nullable = false)
    private int maxPlayers = 5;

    @Column(name = "started_at")
    private Instant startedAt;

    @Column(name = "ended_at")
    private Instant endedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<RaceParticipant> participants = new ArrayList<>();

    public MultiplayerRoom() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getRoomCode() { return roomCode; }
    public void setRoomCode(String roomCode) { this.roomCode = roomCode; }

    public UUID getHostUserId() { return hostUserId; }
    public void setHostUserId(UUID hostUserId) { this.hostUserId = hostUserId; }

    public Passage getPassage() { return passage; }
    public void setPassage(Passage passage) { this.passage = passage; }

    public String getLocale() { return locale; }
    public void setLocale(String locale) { this.locale = locale; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public boolean isPrivate() { return isPrivate; }
    public void setPrivate(boolean aPrivate) { isPrivate = aPrivate; }

    public int getMaxPlayers() { return maxPlayers; }
    public void setMaxPlayers(int maxPlayers) { this.maxPlayers = maxPlayers; }

    public Instant getStartedAt() { return startedAt; }
    public void setStartedAt(Instant startedAt) { this.startedAt = startedAt; }

    public Instant getEndedAt() { return endedAt; }
    public void setEndedAt(Instant endedAt) { this.endedAt = endedAt; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public List<RaceParticipant> getParticipants() { return participants; }
    public void setParticipants(List<RaceParticipant> participants) { this.participants = participants; }
}
