package com.typemaster.typing;

import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/typing-sessions")
public class TypingSessionController {

    private final TypingSessionService typingSessionService;

    public TypingSessionController(TypingSessionService typingSessionService) {
        this.typingSessionService = typingSessionService;
    }

    @PostMapping
    public ResponseEntity<TypingSessionResponse> submitSession(
            @Valid @RequestBody TypingSessionSubmitRequest request,
            Authentication authentication) {
        UUID userId = null;
        if (authentication != null && authentication.isAuthenticated()
                && !"anonymousUser".equals(authentication.getPrincipal())) {
            try {
                userId = UUID.fromString(authentication.getName());
            } catch (Exception ignored) {}
        }
        TypingSessionResponse response = typingSessionService.processAndSaveSession(request, userId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<Page<TypingSessionResponse>> getMyHistory(
            Authentication authentication,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(typingSessionService.getUserHistory(userId, page, size));
    }

    @GetMapping("/me/{id}")
    public ResponseEntity<TypingSessionResponse> getMySession(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(typingSessionService.getUserSessionById(id, userId));
    }

    @DeleteMapping("/me/{id}")
    public ResponseEntity<Void> deleteMySession(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        typingSessionService.deleteUserSession(id, userId);
        return ResponseEntity.noContent().build();
    }
}
