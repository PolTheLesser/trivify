package rh.ptp.quizapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.NoSuchElementException;

@ControllerAdvice
public class GlobalExceptionHandler {

    //  Für eigene oder manuell geworfene Fehler
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(errorBody(ex.getMessage()));
    }

    //  Für Validierungsfehler bei @Valid
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String errorMsg = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage(); // Nur erste Fehlermeldung
        return ResponseEntity.badRequest().body(errorBody(errorMsg));
    }

    //  Fallback für andere RuntimeExceptions
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody("Unerwarteter Fehler: " + ex.getMessage()));
    }

    //  Für NoSuchElementException, z.B. wenn ein Element nicht gefunden wird
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNoSuchElement(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(errorBody("Nicht gefunden: " + ex.getMessage()));
    }

    //  Für ResponseStatusException, z.B. bei @ResponseStatus
    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatusException(org.springframework.web.server.ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(errorBody(ex.getReason() != null ? ex.getReason() : "Fehler: " + ex.getMessage()));
    }

    //  Optionale Methode für mehr Kontext
    private Map<String, Object> errorBody(String message) {
        return Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "error", message
        );
    }
}

