package com.typemaster.multiplayer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface MultiplayerRoomRepository extends JpaRepository<MultiplayerRoom, UUID> {
    Optional<MultiplayerRoom> findByRoomCode(String roomCode);
    boolean existsByRoomCode(String roomCode);
}
