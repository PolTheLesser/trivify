package rh.ptp.wrap.trivify.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ott.InvalidOneTimeTokenException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import rh.ptp.wrap.trivify.exception.*;
import rh.ptp.wrap.trivify.model.response.ErrorResponse;

@RestControllerAdvice
public class ExceptionController {
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleEmailAlreadyExists(EmailAlreadyExistsException e) {
        ErrorResponse error = new ErrorResponse("EMAIL_EXISTS", e.getMessage(), HttpStatus.CONFLICT.value());
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleUsernameAlreadyExists(UsernameAlreadyExistsException e) {
        ErrorResponse error = new ErrorResponse("USERNAME_EXISTS", e.getMessage(), HttpStatus.CONFLICT.value());
        return new ResponseEntity<>(error, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(InvalidOneTimeTokenException.class)
    public ResponseEntity<ErrorResponse> handleInvalidOneTimeToken(InvalidOneTimeTokenException e) {
        ErrorResponse error = new ErrorResponse("INVALID_TOKEN", e.getMessage(), HttpStatus.UNAUTHORIZED.value());
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(ExpiredTokenException.class)
    public ResponseEntity<ErrorResponse> handleExpiredToken(ExpiredTokenException e) {
        ErrorResponse error = new ErrorResponse("EXPIRED_TOKEN", e.getMessage(), HttpStatus.UNAUTHORIZED.value());
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthentication(AuthenticationException e) {
        ErrorResponse error = new ErrorResponse("AUTHENTICATION_FAILED", e.getMessage(), HttpStatus.UNAUTHORIZED.value());
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleAll(Exception e) {
        ErrorResponse error = new ErrorResponse("INVALID_CREDENTIALS", e.getMessage(), HttpStatus.UNAUTHORIZED.value());
        return new ResponseEntity<>(error, HttpStatus.UNAUTHORIZED);
    }
}
