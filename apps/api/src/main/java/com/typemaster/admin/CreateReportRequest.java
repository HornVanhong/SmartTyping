package com.typemaster.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateReportRequest(
        UUID reportedUserId,

        UUID roomId,

        @NotBlank
        @Size(max = 30)
        String category,

        @NotBlank
        @Size(max = 1000)
        String details
) {}
