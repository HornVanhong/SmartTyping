package com.typemaster.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CreatePassageAdminRequest(
        @NotBlank
        @Pattern(regexp = "^(en|km)$", message = "Locale must be 'en' or 'km'")
        String locale,

        @NotBlank
        @Size(max = 160)
        String title,

        @NotBlank
        @Size(min = 10, max = 10000)
        String content,

        @NotBlank
        @Pattern(regexp = "^(BEGINNER|INTERMEDIATE|ADVANCED)$", message = "Difficulty must be BEGINNER, INTERMEDIATE, or ADVANCED")
        String difficulty,

        String category,

        String contentMode,

        String sourceName,

        String licenseName,

        String status
) {}
