package com.typemaster.auth;

import com.typemaster.common.error.BadRequestException;
import com.typemaster.common.error.UnauthorizedException;
import com.typemaster.user.User;
import com.typemaster.user.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Spy
    private PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    @Spy
    private JwtTokenProvider jwtTokenProvider = new JwtTokenProvider(
            "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970",
            900000L
    );

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                refreshTokenRepository,
                passwordEncoder,
                jwtTokenProvider,
                604800000L
        );
    }

    @Test
    @DisplayName("Registers user with hashed password and returns token pair")
    void registersNewUserSuccessfully() {
        RegisterRequest req = new RegisterRequest("test@example.com", "SecurePassword123!", "Typist1", "km");

        when(userRepository.existsByEmailIgnoreCase("test@example.com")).thenReturn(false);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(UUID.randomUUID());
            return u;
        });

        TokenPair pair = authService.register(req);

        assertThat(pair.accessToken()).isNotBlank();
        assertThat(pair.rawRefreshToken()).isNotBlank();
        assertThat(pair.user().email()).isEqualTo("test@example.com");
        assertThat(pair.user().preferredLocale()).isEqualTo("km");

        // Verify password was hashed and not saved as plain text
        verify(userRepository).save(org.mockito.ArgumentMatchers.argThat(user ->
                !user.getPasswordHash().equals("SecurePassword123!") &&
                passwordEncoder.matches("SecurePassword123!", user.getPasswordHash())
        ));
    }

    @Test
    @DisplayName("Rejects duplicate email registration")
    void rejectsDuplicateEmail() {
        RegisterRequest req = new RegisterRequest("existing@example.com", "Password123!", "Typist", "en");
        when(userRepository.existsByEmailIgnoreCase("existing@example.com")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(req))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    @DisplayName("Authenticates valid credentials and rejects invalid password")
    void authenticatesCredentials() {
        String hashed = passwordEncoder.encode("ValidPassword123!");
        User user = new User("user@example.com", hashed, "ValidUser", "en");
        user.setId(UUID.randomUUID());

        when(userRepository.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));

        LoginRequest validLogin = new LoginRequest("user@example.com", "ValidPassword123!");
        TokenPair pair = authService.login(validLogin);
        assertThat(pair.accessToken()).isNotBlank();

        LoginRequest invalidLogin = new LoginRequest("user@example.com", "WrongPassword!");
        assertThatThrownBy(() -> authService.login(invalidLogin))
                .isInstanceOf(UnauthorizedException.class);
    }
}
