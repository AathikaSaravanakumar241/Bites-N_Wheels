package com.food.bitesonwheels.config;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.IncorrectResultSizeDataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    /** Bean-validation failures (@Valid on request body) → 400 */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    /** Wrong credentials → 401 */
    @ExceptionHandler({BadCredentialsException.class, DisabledException.class, LockedException.class})
    public ResponseEntity<Map<String, String>> handleAuthError(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid email or password"));
    }

    /**
     * Database constraint breaches -> 409, with a message a person can read.
     * Without this they fell through to the catch-all below and surfaced the
     * raw SQL error ("duplicate key value violates unique constraint ...").
     */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> handleConstraint(DataIntegrityViolationException ex) {
        String detail = ex.getMostSpecificCause().getMessage();
        String message;
        if (detail != null && detail.contains("uq_truck_owner")) {
            message = "An owner can only have one truck.";
        } else if (detail != null && detail.contains("users_email_key")) {
            message = "That email is already registered.";
        } else if (detail != null && detail.contains("users_phone_key")) {
            message = "That phone number is already registered.";
        } else {
            message = "That change conflicts with existing data.";
        }
        return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", message));
    }

    /**
     * Non-unique result where the code expects one row. An owner holding two
     * trucks used to land here as an opaque 400 that took down every vendor
     * page; docs/one-truck-per-owner.sql plus uq_truck_owner prevent it, and
     * this makes any recurrence say so plainly.
     */
    @ExceptionHandler(IncorrectResultSizeDataAccessException.class)
    public ResponseEntity<Map<String, String>> handleNonUnique(IncorrectResultSizeDataAccessException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", "This account is linked to more than one truck. "
                                      + "Each owner may only have one."));
    }

    /**
     * Catch-all for business-rule RuntimeExceptions (e.g. "Phone number already registered").
     * Returns 400 with the exception message so the frontend can show it to the user.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntime(RuntimeException ex) {
        String msg = ex.getMessage() != null ? ex.getMessage() : "An unexpected error occurred";
        return ResponseEntity.badRequest().body(Map.of("message", msg));
    }
}
