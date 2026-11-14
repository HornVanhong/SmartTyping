package com.typemaster.multiplayer;

public record RoomEvent(
        String type,
        Object payload
) {}
