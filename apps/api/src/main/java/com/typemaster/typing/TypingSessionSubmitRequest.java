package com.typemaster.typing;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record TypingSessionSubmitRequest(
        UUID passageId,

        @NotBlank
        String locale,

        @NotBlank
        String mode,

        @Min(10) @Max(600)
        int durationSeconds,

        @Min(500)
        long elapsedMs,

        @Min(0)
        int correctCharacters,

        @Min(0)
        int incorrectCharacters,

        @Min(0)
        int totalCharacters,

        @NotNull
        BigDecimal clientCpm,

        BigDecimal clientWpm,

        @NotNull
        BigDecimal clientAccuracy
) {}
