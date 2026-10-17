package com.nextrisk.auth.service;

/** Thrown for any unusable refresh token: unknown, expired, revoked, reused or belonging to a disabled user. */
public class InvalidRefreshTokenException extends RuntimeException {

    public InvalidRefreshTokenException(String reason) {
        super(reason);
    }
}
