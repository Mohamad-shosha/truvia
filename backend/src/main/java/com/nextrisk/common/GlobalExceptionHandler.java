package com.nextrisk.common;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextrisk.auth.service.InvalidRefreshTokenException;
import com.nextrisk.auth.service.RefreshCookieFactory;
import jakarta.servlet.http.HttpServletRequest;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private final RefreshCookieFactory cookies;

    public GlobalExceptionHandler(RefreshCookieFactory cookies) {
        this.cookies = cookies;
    }

    @ExceptionHandler(ApiException.class)
    ResponseEntity<Object> handleApi(ApiException ex, HttpServletRequest req) {
        return build(ex.getStatus(), ex.getMessage(), req.getRequestURI(), null, null);
    }

    @ExceptionHandler(InvalidRefreshTokenException.class)
    ResponseEntity<Object> handleInvalidRefresh(InvalidRefreshTokenException ex, HttpServletRequest req) {
        HttpHeaders headers = new HttpHeaders();
        headers.add(HttpHeaders.SET_COOKIE, cookies.clear().toString());
        return build(HttpStatus.UNAUTHORIZED, "Session is no longer valid. Please sign in again.",
                req.getRequestURI(), null, headers);
    }

    @ExceptionHandler(AuthenticationException.class)
    ResponseEntity<Object> handleAuthentication(AuthenticationException ex, HttpServletRequest req) {
        return build(HttpStatus.UNAUTHORIZED, "Invalid email or password", req.getRequestURI(), null, null);
    }

    @ExceptionHandler(AccessDeniedException.class)
    ResponseEntity<Object> handleDenied(AccessDeniedException ex, HttpServletRequest req) {
        return build(HttpStatus.FORBIDDEN, "You do not have permission to perform this action",
                req.getRequestURI(), null, null);
    }

    @ExceptionHandler(Exception.class)
    ResponseEntity<Object> handleUnexpected(Exception ex, HttpServletRequest req) {
        log.error("Unhandled exception on {} {}", req.getMethod(), req.getRequestURI(), ex);
        return build(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred", req.getRequestURI(), null, null);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        List<ApiError.FieldViolation> violations = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> new ApiError.FieldViolation(fe.getField(), fe.getDefaultMessage()))
                .toList();
        return build(HttpStatus.BAD_REQUEST, "Validation failed", path(request), violations, null);
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
            HttpHeaders headers, HttpStatusCode status, WebRequest request) {
        String message = "Malformed or unsupported request body";
        if (ex.getCause() instanceof com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException upe) {
            return build(HttpStatus.BAD_REQUEST, message, path(request),
                    List.of(new ApiError.FieldViolation(upe.getPropertyName(), "Unknown or not allowed field")), null);
        }
        return build(HttpStatus.BAD_REQUEST, message, path(request), null, null);
    }

    @Override
    protected ResponseEntity<Object> handleExceptionInternal(Exception ex, Object body, HttpHeaders headers,
            HttpStatusCode statusCode, WebRequest request) {
        HttpStatus status = HttpStatus.valueOf(statusCode.value());
        return build(status, status.getReasonPhrase(), path(request), null, headers);
    }

    private static String path(WebRequest request) {
        return request instanceof ServletWebRequest swr ? swr.getRequest().getRequestURI() : "";
    }

    private static ResponseEntity<Object> build(HttpStatus status, String message, String path,
            List<ApiError.FieldViolation> violations, HttpHeaders headers) {
        ApiError body = new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message, path, violations);
        ResponseEntity.BodyBuilder builder = ResponseEntity.status(status);
        if (headers != null) {
            builder.headers(headers);
        }
        return builder.body(body);
    }

    /** Used by security entry points to write the same envelope outside MVC. */
    public static void write(jakarta.servlet.http.HttpServletResponse response, ObjectMapper mapper,
            HttpStatus status, String message, String path) throws java.io.IOException {
        response.setStatus(status.value());
        response.setContentType("application/json");
        mapper.writeValue(response.getOutputStream(),
                new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message, path, null));
    }
}
