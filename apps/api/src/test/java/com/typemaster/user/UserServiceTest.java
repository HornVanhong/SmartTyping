package com.typemaster.user;

import com.typemaster.auth.AuthResponse;
import com.typemaster.common.error.ResourceNotFoundException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("Updates user display name and locale successfully")
    void updatesUserProfile() {
        UUID userId = UUID.randomUUID();
        User user = new User("user@example.com", "hash", "OldName", "en");
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UpdateUserRequest update = new UpdateUserRequest("NewName", "km", "#4ED6B8");
        AuthResponse updated = userService.updateUserProfile(userId, update);

        assertThat(updated.displayName()).isEqualTo("NewName");
        assertThat(updated.preferredLocale()).isEqualTo("km");
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Soft deletes user by marking status DELETED")
    void softDeletesUser() {
        UUID userId = UUID.randomUUID();
        User user = new User("user@example.com", "hash", "DisplayName", "en");
        user.setId(userId);

        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        userService.deleteUserAccount(userId);

        assertThat(user.getStatus()).isEqualTo("DELETED");
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Throws ResourceNotFoundException when user does not exist")
    void throwsNotFoundForUnknownUser() {
        UUID unknownId = UUID.randomUUID();
        when(userRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getUserProfile(unknownId))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
