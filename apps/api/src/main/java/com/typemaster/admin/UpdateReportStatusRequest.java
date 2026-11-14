package com.typemaster.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdateReportStatusRequest(
        @NotBlank
        @Pattern(regexp = "^(OPEN|REVIEWING|RESOLVED|DISMISSED)$", message = "Status must be OPEN, REVIEWING, RESOLVED, or DISMISSED")
        String status
) {}
