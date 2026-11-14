package com.typemaster.user;

import com.typemaster.auth.AuthResponse;
import com.typemaster.common.error.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public AuthResponse getUserProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return AuthResponse.fromUser(user);
    }

    public AuthResponse updateUserProfile(UUID userId, UpdateUserRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.displayName() != null && !request.displayName().isBlank()) {
            user.setDisplayName(request.displayName().trim());
        }
        if (request.preferredLocale() != null && !request.preferredLocale().isBlank()) {
            user.setPreferredLocale(request.preferredLocale().toLowerCase());
        }
        if (request.avatarColor() != null && !request.avatarColor().isBlank()) {
            user.setAvatarColor(request.avatarColor().trim());
        }
        user.setUpdatedAt(Instant.now());

        User saved = userRepository.save(user);
        return AuthResponse.fromUser(saved);
    }

    public void deleteUserAccount(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setStatus("DELETED");
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }
}
