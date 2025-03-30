package rh.ptp.wrap.trivify.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import rh.ptp.wrap.trivify.exception.EmailAlreadyExistsException;
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
}
