package com.typemaster.achievement;

import java.time.Instant;
import java.util.UUID;

public record AchievementResponse(
        UUID id,
        String code,
        String nameEn,
        String nameKm,
        String descriptionEn,
        String descriptionKm,
        String iconKey,
        boolean unlocked,
        Instant earnedAt
) {}
