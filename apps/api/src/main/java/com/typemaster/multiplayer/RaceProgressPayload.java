package com.typemaster.multiplayer;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record RaceProgressPayload(
        @NotBlank
        String roomCode,

        @Min(0)
        int progressCharacters,

        @Min(0)
        int correctCharacters,

        @Min(0)
        int incorrectCharacters
) {}
