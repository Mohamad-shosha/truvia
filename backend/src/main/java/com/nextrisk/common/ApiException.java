package com.nextrisk.common;

import org.springframework.http.HttpStatus;

/** Domain exception mapped to a specific HTTP status with a safe, client-facing message. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
