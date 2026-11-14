package com.typemaster.admin;

import com.typemaster.content.PassageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/passages")
@PreAuthorize("hasAnyRole('ADMIN', 'MODERATOR')")
public class AdminPassageController {

    private final AdminPassageService adminPassageService;

    public AdminPassageController(AdminPassageService adminPassageService) {
        this.adminPassageService = adminPassageService;
    }

    @PostMapping
    public ResponseEntity<PassageResponse> createPassage(
            @Valid @RequestBody CreatePassageAdminRequest request,
            Authentication authentication) {
        UUID adminUserId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(adminPassageService.createPassage(request, adminUserId));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<PassageResponse> updatePassage(
            @PathVariable UUID id,
            @Valid @RequestBody UpdatePassageAdminRequest request,
            Authentication authentication) {
        UUID adminUserId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(adminPassageService.updatePassage(id, request, adminUserId));
    }

    @PostMapping("/{id}/publish")
    public ResponseEntity<PassageResponse> publishPassage(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID adminUserId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(adminPassageService.publishPassage(id, adminUserId));
    }

    @PostMapping("/{id}/archive")
    public ResponseEntity<PassageResponse> archivePassage(
            @PathVariable UUID id,
            Authentication authentication) {
        UUID adminUserId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(adminPassageService.archivePassage(id, adminUserId));
    }

    @GetMapping
    public ResponseEntity<Page<PassageResponse>> listPassages(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String locale,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(adminPassageService.listPassages(status, locale, PageRequest.of(page, Math.min(size, 100))));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PassageResponse> getPassage(@PathVariable UUID id) {
        return ResponseEntity.ok(adminPassageService.getPassage(id));
    }
}
