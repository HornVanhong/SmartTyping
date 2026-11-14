package com.typemaster.auth;

import com.typemaster.user.User;
import java.util.UUID;

public record AuthResponse(
        UUID id,
        String email,
        String displayName,
        String preferredLocale,
        String role
) {
    public static AuthResponse fromUser(User user) {
        return new AuthResponse(
                user.getId(),
                user.getEmail(),
                user.getDisplayName(),
                user.getPreferredLocale(),
                user.getRole()
        );
    }
}
