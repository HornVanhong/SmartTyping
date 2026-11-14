package com.typemaster.common.error;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        List<FieldErrorItem> fieldErrors = new ArrayList<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.add(new FieldErrorItem(fe.getField(), fe.getDefaultMessage()));
        }

        ErrorResponse error = new ErrorResponse(
                "https://typemaster.example/errors/validation",
                "Validation failed",
                HttpStatus.BAD_REQUEST.value(),
                "One or more fields in the request are invalid.",
                request.getRequestURI(),
                "VALIDATION_ERROR",
                traceId,
                fieldErrors
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(BadRequestException.class)
    public ResponseEntity<ErrorResponse> handleBadRequest(
            BadRequestException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        ErrorResponse error = new ErrorResponse(
                "https://typemaster.example/errors/bad-request",
                "Bad request",
                HttpStatus.BAD_REQUEST.value(),
                ex.getMessage(),
                request.getRequestURI(),
                "BAD_REQUEST",
                traceId
        );
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(
            ResourceNotFoundException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        ErrorResponse error = new ErrorResponse(
                "https://typemaster.example/errors/not-found",
                "Resource not found",
                HttpStatus.NOT_FOUND.value(),
                ex.getMessage(),
                request.getRequestURI(),
                "NOT_FOUND",
                traceId
        );
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler({UnauthorizedException.class, BadCredentialsException.class})
    public ResponseEntity<ErrorResponse> handleUnauthorized(
            RuntimeException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        ErrorResponse error = new ErrorResponse(
                "https://typemaster.example/errors/unauthorized",
                "Unauthorized",
                HttpStatus.UNAUTHORIZED.value(),
                "Authentication failed or token invalid.",
                request.getRequestURI(),
                "UNAUTHORIZED",
                traceId
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        ErrorResponse error = new ErrorResponse(
                "https://typemaster.example/errors/forbidden",
                "Forbidden",
                HttpStatus.FORBIDDEN.value(),
                "You do not have permission to access this resource.",
                request.getRequestURI(),
                "FORBIDDEN",
                traceId
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(
            Exception ex, HttpServletRequest request) {
        String traceId = UUID.randomUUID().toString();
        log.error("Unhandled internal server error [traceId={}]: {}", traceId, ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse(
                "https://typemaster.example/errors/internal",
                "Internal server error",
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                "An unexpected server error occurred. Please try again later.",
                request.getRequestURI(),
                "INTERNAL_ERROR",
                traceId
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }
}
