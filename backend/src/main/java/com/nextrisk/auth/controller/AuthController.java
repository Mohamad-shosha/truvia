package com.nextrisk.auth.controller;

import com.nextrisk.auth.dto.AuthResponse;
import com.nextrisk.auth.dto.ChangePasswordRequest;
import com.nextrisk.auth.dto.LoginRequest;
import com.nextrisk.auth.dto.UserResponse;
import com.nextrisk.auth.service.AuthService;
import com.nextrisk.auth.service.RefreshCookieFactory;
import com.nextrisk.common.ApiError;
import com.nextrisk.common.ApiException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentication")
public class AuthController {

    static final String CSRF_HEADER = "X-Requested-With";
    static final String CSRF_VALUE = "XMLHttpRequest";

    private final AuthService authService;
    private final RefreshCookieFactory cookies;

    public AuthController(AuthService authService, RefreshCookieFactory cookies) {
        this.authService = authService;
        this.cookies = cookies;
    }

    @PostMapping("/login")
    @Operation(summary = "Sign in",
            description = "Returns a short-lived access token in the body (send as `Authorization: Bearer`). "
                    + "A rotating refresh token is set in the HttpOnly `nr_refresh` cookie (path /api/auth).")
    @ApiResponse(responseCode = "200", description = "Authenticated")
    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "401", description = "Invalid credentials or disabled account (same message)", content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return withCookie(authService.login(request));
    }

    @PostMapping("/refresh")
    @Operation(summary = "Rotate refresh token and get a new access token",
            description = "Reads the `nr_refresh` cookie. Requires header `X-Requested-With: XMLHttpRequest`. "
                    + "The used token is revoked; replaying it revokes the whole session family.")
    @ApiResponse(responseCode = "200", description = "New access token; new refresh cookie set")
    @ApiResponse(responseCode = "401", description = "Missing, expired, revoked or reused refresh token (cookie cleared)", content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "403", description = "Missing X-Requested-With header", content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest request) {
        requireCsrfHeader(request);
        return withCookie(authService.refresh(readRefreshCookie(request)));
    }

    @PostMapping("/logout")
    @Operation(summary = "Sign out",
            description = "Revokes the server-side refresh-token family for the cookie presented and clears the cookie. "
                    + "Idempotent. Requires header `X-Requested-With: XMLHttpRequest`.")
    @ApiResponse(responseCode = "204", description = "Cookie cleared; any matching server session revoked")
    @ApiResponse(responseCode = "403", description = "Missing X-Requested-With header", content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ResponseEntity<Void> logout(HttpServletRequest request) {
        requireCsrfHeader(request);
        authService.logout(readRefreshCookie(request));
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, cookies.clear().toString())
                .build();
    }

    @GetMapping("/me")
    @Operation(summary = "Current authenticated user", security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Current user")
    @ApiResponse(responseCode = "401", description = "Missing/invalid/expired token or disabled user", content = @Content(schema = @Schema(implementation = ApiError.class)))
    public UserResponse me(@AuthenticationPrincipal Jwt jwt) {
        return authService.currentUser(jwt.getSubject());
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change own password",
            description = "Allows an authenticated user to update their current password to a new secret password.",
            security = @SecurityRequirement(name = "bearerAuth"))
    @ApiResponse(responseCode = "200", description = "Password changed successfully")
    @ApiResponse(responseCode = "400", description = "Validation failed or wrong current password", content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "401", description = "Unauthorized", content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ResponseEntity<Map<String, String>> changePassword(
            @AuthenticationPrincipal Jwt jwt,
            @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(jwt.getSubject(), request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    private ResponseEntity<AuthResponse> withCookie(AuthService.Session session) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookies.create(session.refreshToken(), session.rememberMe()).toString())
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(session.body());
    }

    private String readRefreshCookie(HttpServletRequest request) {
        Cookie[] all = request.getCookies();
        if (all == null) {
            return null;
        }
        for (Cookie c : all) {
            if (c.getName().equals(cookies.cookieName())) {
                return c.getValue();
            }
        }
        return null;
    }

    private static void requireCsrfHeader(HttpServletRequest request) {
        if (!CSRF_VALUE.equals(request.getHeader(CSRF_HEADER))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Missing required " + CSRF_HEADER + " header");
        }
    }
}
