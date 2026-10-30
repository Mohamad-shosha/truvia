package com.nextrisk.auth.controller;

import com.nextrisk.auth.dto.AdminUserResponse;
import com.nextrisk.auth.dto.CreateUserRequest;
import com.nextrisk.auth.dto.ResetPasswordRequest;
import com.nextrisk.auth.service.AuthService;
import com.nextrisk.common.ApiError;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Admin User Management")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "bearerAuth")
public class AdminUserController {

    private final AuthService authService;

    public AdminUserController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping
    @Operation(summary = "List all company users", description = "ROLE_ADMIN only. Returns all registered users.")
    @ApiResponse(responseCode = "200", description = "User list")
    @ApiResponse(responseCode = "403", description = "Forbidden - requires ROLE_ADMIN")
    public List<AdminUserResponse> listUsers() {
        return authService.listAllUsers();
    }

    @PostMapping
    @Operation(summary = "Create a company user account with a role",
            description = "ROLE_ADMIN only. Provisions an account for an employee and assigns a specific role.")
    @ApiResponse(responseCode = "201", description = "User created")
    @ApiResponse(responseCode = "400", description = "Validation failed", content = @Content(schema = @Schema(implementation = ApiError.class)))
    @ApiResponse(responseCode = "409", description = "Email already registered", content = @Content(schema = @Schema(implementation = ApiError.class)))
    public ResponseEntity<AdminUserResponse> createUser(@Valid @RequestBody CreateUserRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.createUserByAdmin(request));
    }

    @PostMapping("/{id}/reset-password")
    @Operation(summary = "Reset an employee's password",
            description = "ROLE_ADMIN only. Sets a new password for the specified user and revokes their active sessions.")
    @ApiResponse(responseCode = "200", description = "Password reset successfully")
    @ApiResponse(responseCode = "404", description = "User not found")
    public ResponseEntity<Map<String, String>> resetPassword(
            @PathVariable Long id,
            @Valid @RequestBody ResetPasswordRequest request) {
        authService.adminResetPassword(id, request);
        return ResponseEntity.ok(Map.of("message", "Password reset successfully"));
    }
}

