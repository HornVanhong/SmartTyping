package com.typemaster.multiplayer;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record RoomResponse(
        UUID id,
        String roomCode,
        UUID hostUserId,
        String locale,
        String status,
        boolean isPrivate,
        int maxPlayers,
        UUID passageId,
        String passageContent,
        String passageTitle,
        List<ParticipantResponse> participants,
        Instant startedAt,
        Instant endedAt,
        Instant createdAt
) {
    public static RoomResponse fromEntity(MultiplayerRoom room) {
        List<ParticipantResponse> participantList = room.getParticipants() != null
                ? room.getParticipants().stream().map(ParticipantResponse::fromEntity).toList()
                : List.of();

        return new RoomResponse(
                room.getId(),
                room.getRoomCode(),
                room.getHostUserId(),
                room.getLocale(),
                room.getStatus(),
                room.isPrivate(),
                room.getMaxPlayers(),
                room.getPassage() != null ? room.getPassage().getId() : null,
                room.getPassage() != null ? room.getPassage().getContent() : "",
                room.getPassage() != null ? room.getPassage().getTitle() : "",
                participantList,
                room.getStartedAt(),
                room.getEndedAt(),
                room.getCreatedAt()
        );
    }
}
