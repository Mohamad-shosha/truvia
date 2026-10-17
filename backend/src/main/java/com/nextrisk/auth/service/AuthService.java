package com.nextrisk.auth.service;

import com.nextrisk.auth.dto.AuthResponse;
import com.nextrisk.auth.dto.LoginRequest;
import com.nextrisk.auth.dto.RegisterRequest;
import com.nextrisk.auth.dto.UserResponse;
import com.nextrisk.auth.entity.Role;
import com.nextrisk.auth.entity.User;
import com.nextrisk.auth.repository.RoleRepository;
import com.nextrisk.auth.repository.UserRepository;
import com.nextrisk.common.ApiException;
import com.nextrisk.security.JwtService;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    /** Result of login/refresh: the JSON body plus the raw refresh token destined for the cookie. */
    public record Session(AuthResponse body, String refreshToken, boolean rememberMe) {
        @Override
        public String toString() {
            return "Session[user=" + body.user() + "]";
        }
    }

    private final UserRepository users;
    private final RoleRepository roles;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokens;

    public AuthService(UserRepository users, RoleRepository roles, PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager, JwtService jwtService, RefreshTokenService refreshTokens) {
        this.users = users;
        this.roles = roles;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokens = refreshTokens;
    }

    public static String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
    }

    static String normalizeName(String name) {
        return name == null ? "" : name.trim().replaceAll("\\s+", " ");
    }

    @Transactional
    public UserResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (users.existsByEmail(email)) {
            throw new EmailAlreadyExistsException();
        }
        Role role = roles.findByName(Role.DEFAULT_REGISTRATION_ROLE)
                .orElseThrow(() -> new IllegalStateException("Default role is missing; run database migrations"));
        User user = new User(normalizeName(request.fullName()), email, passwordEncoder.encode(request.password()));
        user.getRoles().add(role);
        try {
            users.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            // Lost a race with a concurrent registration of the same email.
            throw new EmailAlreadyExistsException();
        }
        log.info("User registered (userId={})", user.getId());
        return UserResponse.from(user);
    }

    @Transactional
    public Session login(LoginRequest request) {
        String email = normalizeEmail(request.email());
        try {
            // Covers unknown user, wrong password and disabled accounts; all surface identically to the client.
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (AuthenticationException e) {
            log.info("Failed login attempt");
            throw new BadCredentialsException("Invalid email or password");
        }
        User user = users.findByEmail(email).orElseThrow(() -> new BadCredentialsException("Invalid email or password"));
        RefreshTokenService.Issued refresh = refreshTokens.issue(user, request.rememberMe());
        log.info("User logged in (userId={})", user.getId());
        return new Session(buildResponse(user), refresh.rawToken(), request.rememberMe());
    }

    /** Rotates the refresh token and issues a new access token. */
    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public Session refresh(String rawRefreshToken) {
        RefreshTokenService.Issued issued = refreshTokens.rotate(rawRefreshToken);
        User user = issued.token().getUser();
        return new Session(buildResponse(user), issued.rawToken(), issued.token().isRememberMe());
    }

    /** @return true when a server-side session was actually revoked. */
    public boolean logout(String rawRefreshToken) {
        return refreshTokens.revoke(rawRefreshToken);
    }

    @Transactional(readOnly = true)
    public UserResponse currentUser(String subject) {
        long id;
        try {
            id = Long.parseLong(subject);
        } catch (NumberFormatException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Authentication is required or the token is invalid");
        }
        User user = users.findById(id)
                .filter(User::isEnabled)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Authentication is required or the token is invalid"));
        return UserResponse.from(user);
    }

    private AuthResponse buildResponse(User user) {
        return new AuthResponse(jwtService.issueAccessToken(user), "Bearer", jwtService.expiresInSeconds(),
                UserResponse.from(user));
    }
}
