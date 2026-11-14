package com.typemaster.multiplayer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RaceParticipantRepository extends JpaRepository<RaceParticipant, UUID> {
    List<RaceParticipant> findByRoomId(UUID roomId);
    Optional<RaceParticipant> findByRoomIdAndUserId(UUID roomId, UUID userId);
    boolean existsByRoomIdAndUserId(UUID roomId, UUID userId);
}
