package com.typemaster.multiplayer;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/rooms")
public class MultiplayerController {

    private final MultiplayerService multiplayerService;

    public MultiplayerController(MultiplayerService multiplayerService) {
        this.multiplayerService = multiplayerService;
    }

    @PostMapping
    public ResponseEntity<RoomResponse> createRoom(
            @Valid @RequestBody CreateRoomRequest request,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(multiplayerService.createRoom(request, userId));
    }

    @PostMapping("/{code}/join")
    public ResponseEntity<RoomResponse> joinRoom(
            @PathVariable String code,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(multiplayerService.joinRoom(code, userId));
    }

    @GetMapping("/{code}")
    public ResponseEntity<RoomResponse> getRoom(@PathVariable String code) {
        return ResponseEntity.ok(multiplayerService.getRoomSnapshot(code));
    }

    @PostMapping("/{code}/ready")
    public ResponseEntity<RoomResponse> markReady(
            @PathVariable String code,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(multiplayerService.markReady(code, userId));
    }

    @PostMapping("/{code}/progress")
    public ResponseEntity<ParticipantResponse> updateProgress(
            @PathVariable String code,
            @Valid @RequestBody RaceProgressPayload payload,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(multiplayerService.updateProgress(payload, userId));
    }

    @PostMapping("/{code}/leave")
    public ResponseEntity<Void> leaveRoom(
            @PathVariable String code,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        multiplayerService.leaveRoom(code, userId);
        return ResponseEntity.noContent().build();
    }
}
