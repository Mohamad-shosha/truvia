package com.nextrisk.auth.service;

import com.nextrisk.common.ApiException;
import org.springframework.http.HttpStatus;

public class EmailAlreadyExistsException extends ApiException {

    public EmailAlreadyExistsException() {
        super(HttpStatus.CONFLICT, "An account with this email already exists");
    }
}
