package com.nextrisk.auth.controller;

import com.nextrisk.auth.dto.SessionResponse;
import com.nextrisk.auth.service.AuthService;
import com.nextrisk.auth.service.RefreshCookieFactory;
import com.nextrisk.auth.service.SessionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Lives under /api/auth so the browser also sends the path-scoped refresh cookie, which is how the
 * session making the request is recognised (and kept) without exposing the token itself.
 */
@RestController
@RequestMapping("/api/auth/sessions")
@Tag(name = "Sessions")
@SecurityRequirement(name = "bearerAuth")
public class SessionController {

    private final SessionService sessions;
    private final RefreshCookieFactory cookies;

    public SessionController(SessionService sessions, RefreshCookieFactory cookies) {
        this.sessions = sessions;
        this.cookies = cookies;
    }

    @GetMapping
    @Operation(summary = "List my active sessions", description = "Newest first. `current` marks this browser's session.")
    @ApiResponse(responseCode = "200", description = "Active sessions")
    public List<SessionResponse> list(@AuthenticationPrincipal Jwt jwt, HttpServletRequest request) {
        return sessions.listActive(AuthService.userIdFrom(jwt.getSubject()), cookies.readFrom(request));
    }

    @DeleteMapping("/{sessionId}")
    @Operation(summary = "Sign out one of my sessions")
    @ApiResponse(responseCode = "204", description = "Session signed out")
    @ApiResponse(responseCode = "404", description = "No such session for the current user")
    public ResponseEntity<Void> revoke(@AuthenticationPrincipal Jwt jwt, @PathVariable String sessionId) {
        sessions.revoke(AuthService.userIdFrom(jwt.getSubject()), sessionId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Operation(summary = "Sign out all my other sessions", description = "The session making the request stays signed in.")
    @ApiResponse(responseCode = "200", description = "Number of sessions signed out")
    public Map<String, Integer> revokeOthers(@AuthenticationPrincipal Jwt jwt, HttpServletRequest request) {
        return Map.of("revoked",
                sessions.revokeOthers(AuthService.userIdFrom(jwt.getSubject()), cookies.readFrom(request)));
    }
}
