package com.typemaster.achievement;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "user_achievements")
public class UserAchievement {

    @EmbeddedId
    private UserAchievementId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("achievementId")
    @JoinColumn(name = "achievement_id")
    private Achievement achievement;

    @Column(name = "earned_at", nullable = false)
    private Instant earnedAt = Instant.now();

    public UserAchievement() {}

    public UserAchievement(UserAchievementId id, Achievement achievement) {
        this.id = id;
        this.achievement = achievement;
        this.earnedAt = Instant.now();
    }

    public UserAchievementId getId() { return id; }
    public void setId(UserAchievementId id) { this.id = id; }

    public Achievement getAchievement() { return achievement; }
    public void setAchievement(Achievement achievement) { this.achievement = achievement; }

    public Instant getEarnedAt() { return earnedAt; }
    public void setEarnedAt(Instant earnedAt) { this.earnedAt = earnedAt; }
}
