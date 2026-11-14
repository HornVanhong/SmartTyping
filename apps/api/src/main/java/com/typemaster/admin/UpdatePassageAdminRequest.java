package com.typemaster.admin;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdatePassageAdminRequest(
        @Size(max = 160)
        String title,

        @Size(min = 10, max = 10000)
        String content,

        @Pattern(regexp = "^(BEGINNER|INTERMEDIATE|ADVANCED)$", message = "Difficulty must be BEGINNER, INTERMEDIATE, or ADVANCED")
        String difficulty,

        String category,

        String contentMode,

        @Pattern(regexp = "^(DRAFT|PUBLISHED|ARCHIVED)$", message = "Status must be DRAFT, PUBLISHED, or ARCHIVED")
        String status
) {}
