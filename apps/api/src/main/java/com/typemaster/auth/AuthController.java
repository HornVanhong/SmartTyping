package com.typemaster.auth;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(
            @Valid @RequestBody RegisterRequest request,
            HttpServletResponse response) {
        TokenPair pair = authService.register(request);
        setAuthCookies(response, pair);
        return ResponseEntity.ok(Map.of(
                "user", pair.user(),
                "accessToken", pair.accessToken()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletResponse response) {
        TokenPair pair = authService.login(request);
        setAuthCookies(response, pair);
        return ResponseEntity.ok(Map.of(
                "user", pair.user(),
                "accessToken", pair.accessToken()
        ));
    }

    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request,
            HttpServletResponse response) {

        String rawToken = null;
        if (body != null && body.containsKey("refreshToken")) {
            rawToken = body.get("refreshToken");
        } else if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    rawToken = cookie.getValue();
                    break;
                }
            }
        }

        TokenPair pair = authService.refresh(rawToken);
        setAuthCookies(response, pair);
        return ResponseEntity.ok(Map.of(
                "user", pair.user(),
                "accessToken", pair.accessToken()
        ));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(
            @RequestBody(required = false) Map<String, String> body,
            HttpServletRequest request,
            HttpServletResponse response) {

        String rawToken = null;
        if (body != null && body.containsKey("refreshToken")) {
            rawToken = body.get("refreshToken");
        } else if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("refresh_token".equals(cookie.getName())) {
                    rawToken = cookie.getValue();
                    break;
                }
            }
        }

        authService.logout(rawToken);
        clearAuthCookies(response);
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> getMe(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(authService.getCurrentUser(userId));
    }

    private void setAuthCookies(HttpServletResponse response, TokenPair pair) {
        Cookie accessCookie = new Cookie("access_token", pair.accessToken());
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(15 * 60);

        Cookie refreshCookie = new Cookie("refresh_token", pair.rawRefreshToken());
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/api/v1/auth");
        refreshCookie.setMaxAge(7 * 24 * 60 * 60);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }

    private void clearAuthCookies(HttpServletResponse response) {
        Cookie accessCookie = new Cookie("access_token", "");
        accessCookie.setHttpOnly(true);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);

        Cookie refreshCookie = new Cookie("refresh_token", "");
        refreshCookie.setHttpOnly(true);
        refreshCookie.setPath("/api/v1/auth");
        refreshCookie.setMaxAge(0);

        response.addCookie(accessCookie);
        response.addCookie(refreshCookie);
    }
}
