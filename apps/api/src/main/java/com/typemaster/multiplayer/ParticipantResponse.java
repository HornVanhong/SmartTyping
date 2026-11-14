package com.typemaster.multiplayer;

import java.math.BigDecimal;
import java.util.UUID;

public record ParticipantResponse(
        UUID id,
        UUID userId,
        String displayName,
        String avatarColor,
        int progressCharacters,
        int correctCharacters,
        int incorrectCharacters,
        Long finishElapsedMs,
        BigDecimal finalCpm,
        BigDecimal finalWpm,
        Integer placement,
        String status
) {
    public static ParticipantResponse fromEntity(RaceParticipant p) {
        return new ParticipantResponse(
                p.getId(),
                p.getUser() != null ? p.getUser().getId() : null,
                p.getUser() != null ? p.getUser().getDisplayName() : "Anonymous",
                p.getUser() != null ? p.getUser().getAvatarColor() : "#7C8CFF",
                p.getProgressCharacters(),
                p.getCorrectCharacters(),
                p.getIncorrectCharacters(),
                p.getFinishElapsedMs(),
                p.getFinalCpm(),
                p.getFinalWpm(),
                p.getPlacement(),
                p.getStatus()
        );
    }
}
