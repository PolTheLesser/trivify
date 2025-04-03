package rh.ptp.wrap.trivify.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.ott.InvalidOneTimeTokenException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import rh.ptp.wrap.trivify.exception.EmailAlreadyExistsException;
import rh.ptp.wrap.trivify.exception.ExpiredTokenException;
import rh.ptp.wrap.trivify.exception.UsernameAlreadyExistsException;

@RestControllerAdvice
public class ExceptionController {
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<String> handleEmailAlreadyExists(EmailAlreadyExistsException e) {
        return ResponseEntity.ok().body(e.getMessage());
    }

    @ExceptionHandler(UsernameAlreadyExistsException.class)
    public ResponseEntity<String> handleUsernameAlreadyExists(UsernameAlreadyExistsException e) {
        return ResponseEntity.ok().body(e.getMessage());
    }

    @ExceptionHandler(InvalidOneTimeTokenException.class)
    public ResponseEntity<String> handleInvalidOneTimeToken(InvalidOneTimeTokenException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
    }

    @ExceptionHandler(ExpiredTokenException.class)
    public ResponseEntity<String> handleExpiredToken(ExpiredTokenException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage()); //TODO Seite, die einen Button hat, welcher ein neues Token sendet; User und token werden mitgesendet? oder nur token?
    }
}
