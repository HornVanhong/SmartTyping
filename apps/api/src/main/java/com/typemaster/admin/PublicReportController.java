package com.typemaster.admin;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/reports")
public class PublicReportController {

    private final ModerationService moderationService;

    public PublicReportController(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @PostMapping
    public ResponseEntity<UserReportResponse> submitReport(
            @Valid @RequestBody CreateReportRequest request,
            Authentication authentication) {
        UUID reporterUserId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(moderationService.createReport(request, reporterUserId));
    }
}
