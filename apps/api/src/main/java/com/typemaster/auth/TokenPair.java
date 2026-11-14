package com.typemaster.auth;

public record TokenPair(
        String accessToken,
        String rawRefreshToken,
        AuthResponse user
) {}
