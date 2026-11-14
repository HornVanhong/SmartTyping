package com.typemaster.auth;

import com.typemaster.common.error.BadRequestException;
import com.typemaster.common.error.ResourceNotFoundException;
import com.typemaster.common.error.UnauthorizedException;
import com.typemaster.user.User;
import com.typemaster.user.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Service
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final long refreshTokenExpirationMs;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtTokenProvider jwtTokenProvider,
            @Value("${app.jwt.refresh-token-expiration-ms:604800000}") long refreshTokenExpirationMs) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    public TokenPair register(RegisterRequest req) {
        if (userRepository.existsByEmailIgnoreCase(req.email())) {
            throw new BadRequestException("An account with this email already exists.");
        }

        User user = new User(
                req.email().toLowerCase().trim(),
                passwordEncoder.encode(req.password()),
                req.displayName().trim(),
                req.preferredLocale() != null ? req.preferredLocale() : "en"
        );
        User saved = userRepository.save(user);

        return createTokenPair(saved);
    }

    public TokenPair login(LoginRequest req) {
        User user = userRepository.findByEmailIgnoreCase(req.email().trim())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password."));

        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password.");
        }

        if (!"ACTIVE".equals(user.getStatus())) {
            throw new UnauthorizedException("Account is not active.");
        }

        return createTokenPair(user);
    }

    public TokenPair refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new UnauthorizedException("Refresh token is required.");
        }

        String hash = hashToken(rawRefreshToken);
        RefreshToken token = refreshTokenRepository.findByTokenHash(hash)
                .orElseThrow(() -> new UnauthorizedException("Invalid refresh token."));

        if (!token.isActive()) {
            throw new UnauthorizedException("Refresh token is expired or revoked.");
        }

        // Revoke the old token (token rotation)
        token.setRevokedAt(Instant.now());
        refreshTokenRepository.save(token);

        User user = token.getUser();
        if (!"ACTIVE".equals(user.getStatus())) {
            throw new UnauthorizedException("Account is not active.");
        }

        return createTokenPair(user);
    }

    public void logout(String rawRefreshToken) {
        if (rawRefreshToken != null && !rawRefreshToken.isBlank()) {
            String hash = hashToken(rawRefreshToken);
            refreshTokenRepository.findByTokenHash(hash).ifPresent(token -> {
                token.setRevokedAt(Instant.now());
                refreshTokenRepository.save(token);
            });
        }
    }

    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        return AuthResponse.fromUser(user);
    }

    private TokenPair createTokenPair(User user) {
        String accessToken = jwtTokenProvider.generateAccessToken(
                user.getId(), user.getEmail(), user.getRole(), user.getDisplayName());

        String rawRefreshToken = UUID.randomUUID().toString() + "-" + UUID.randomUUID().toString();
        String tokenHash = hashToken(rawRefreshToken);
        Instant expiresAt = Instant.now().plusMillis(refreshTokenExpirationMs);

        RefreshToken refreshToken = new RefreshToken(user, tokenHash, expiresAt);
        refreshTokenRepository.save(refreshToken);

        return new TokenPair(accessToken, rawRefreshToken, AuthResponse.fromUser(user));
    }

    private String hashToken(String raw) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(raw.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}
