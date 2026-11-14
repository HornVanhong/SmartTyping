package com.typemaster.user;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(min = 2, max = 40)
        String displayName,

        @Pattern(regexp = "^(en|km)$", message = "preferredLocale must be either 'en' or 'km'")
        String preferredLocale,

        @Size(max = 16)
        String avatarColor
) {}
