package rh.ptp.quizapp.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Globaler Exception-Handler für das QuizApp-Backend.
 * <p>
 * Diese Klasse fängt verschiedene Arten von Ausnahmen ab, die zur Laufzeit
 * während HTTP-Anfragen auftreten können, und gibt konsistente und
 * strukturierte Fehlermeldungen an den Client zurück.
 * </p>
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    /**
     * Behandelt {@link IllegalArgumentException}, typischerweise bei ungültigen oder
     * manuell geprüften Eingaben.
     *
     * @param ex Die geworfene IllegalArgumentException
     * @return ResponseEntity mit HTTP-Status 400 (Bad Request) und Fehlermeldung
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(errorBody(ex.getMessage()));
    }

    /**
     * Behandelt Validierungsfehler, die durch die Annotation {@code @Valid}
     * ausgelöst werden, insbesondere {@link org.springframework.web.bind.MethodArgumentNotValidException}.
     *
     * @param ex Die geworfene Validierungs-Exception
     * @return ResponseEntity mit HTTP-Status 400 (Bad Request) und erster Validierungsfehlermeldung
     */
    @ExceptionHandler(org.springframework.web.bind.MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationErrors(org.springframework.web.bind.MethodArgumentNotValidException ex) {
        String errorMsg = ex.getBindingResult().getAllErrors().get(0).getDefaultMessage(); // Nur erste Fehlermeldung
        return ResponseEntity.badRequest().body(errorBody(errorMsg));
    }

    /**
     * Allgemeiner Fallback für alle anderen nicht speziell behandelten {@link RuntimeException}s.
     *
     * @param ex Die aufgetretene RuntimeException
     * @return ResponseEntity mit HTTP-Status 500 (Internal Server Error) und Fehlermeldung
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntime(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(errorBody("Unerwarteter Fehler: " + ex.getMessage()));
    }

    /**
     * Behandelt {@link NoSuchElementException}, z. B. wenn ein angefordertes Element
     * in einer Datenbank oder Liste nicht gefunden wird.
     *
     * @param ex Die geworfene NoSuchElementException
     * @return ResponseEntity mit HTTP-Status 404 (Not Found) und Fehlermeldung
     */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<?> handleNoSuchElement(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(errorBody("Nicht gefunden: " + ex.getMessage()));
    }

    /**
     * Behandelt {@link org.springframework.web.server.ResponseStatusException},
     * welche explizit mit einem HTTP-Status geworfen werden kann.
     *
     * @param ex Die geworfene ResponseStatusException
     * @return ResponseEntity mit dem im Exception enthaltenen HTTP-Status und entsprechender Fehlermeldung
     */
    @ExceptionHandler(org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<?> handleResponseStatusException(org.springframework.web.server.ResponseStatusException ex) {
        return ResponseEntity.status(ex.getStatusCode())
                .body(errorBody(ex.getReason() != null ? ex.getReason() : "Fehler: " + ex.getMessage()));
    }

    /**
     * Erstellt eine standardisierte Fehlerantwort mit Zeitstempel und Fehlermeldung.
     *
     * @param message Die anzuzeigende Fehlermeldung
     * @return Map mit Zeitstempel und Fehlertext
     */
    private Map<String, Object> errorBody(String message) {
        return Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "error", message
        );
    }
}