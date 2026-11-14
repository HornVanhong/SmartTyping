package com.typemaster.multiplayer;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateRoomRequest(
        @NotBlank
        String locale,

        String difficulty,

        boolean isPrivate,

        @Min(2) @Max(10)
        int maxPlayers
) {}
