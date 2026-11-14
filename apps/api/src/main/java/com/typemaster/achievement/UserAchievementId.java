package com.typemaster.achievement;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import java.util.Objects;
import java.util.UUID;

@Embeddable
public class UserAchievementId implements Serializable {

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "achievement_id")
    private UUID achievementId;

    public UserAchievementId() {}

    public UserAchievementId(UUID userId, UUID achievementId) {
        this.userId = userId;
        this.achievementId = achievementId;
    }

    public UUID getUserId() { return userId; }
    public void setUserId(UUID userId) { this.userId = userId; }

    public UUID getAchievementId() { return achievementId; }
    public void setAchievementId(UUID achievementId) { this.achievementId = achievementId; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof UserAchievementId that)) return false;
        return Objects.equals(userId, that.userId) && Objects.equals(achievementId, that.achievementId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(userId, achievementId);
    }
}
