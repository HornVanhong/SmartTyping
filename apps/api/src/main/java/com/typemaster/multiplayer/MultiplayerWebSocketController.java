package com.typemaster.multiplayer;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;
import java.util.UUID;

@Controller
public class MultiplayerWebSocketController {

    private final MultiplayerService multiplayerService;

    public MultiplayerWebSocketController(MultiplayerService multiplayerService) {
        this.multiplayerService = multiplayerService;
    }

    @MessageMapping("/room.join")
    public void handleJoin(@Payload Map<String, String> payload, Principal principal) {
        if (principal == null) return;
        String roomCode = payload.get("roomCode");
        UUID userId = UUID.fromString(principal.getName());
        multiplayerService.joinRoom(roomCode, userId);
    }

    @MessageMapping("/room.ready")
    public void handleReady(@Payload Map<String, String> payload, Principal principal) {
        if (principal == null) return;
        String roomCode = payload.get("roomCode");
        UUID userId = UUID.fromString(principal.getName());
        multiplayerService.markReady(roomCode, userId);
    }

    @MessageMapping("/race.progress")
    public void handleProgress(@Payload RaceProgressPayload payload, Principal principal) {
        if (principal == null) return;
        UUID userId = UUID.fromString(principal.getName());
        multiplayerService.updateProgress(payload, userId);
    }

    @MessageMapping("/room.leave")
    public void handleLeave(@Payload Map<String, String> payload, Principal principal) {
        if (principal == null) return;
        String roomCode = payload.get("roomCode");
        UUID userId = UUID.fromString(principal.getName());
        multiplayerService.leaveRoom(roomCode, userId);
    }
}
