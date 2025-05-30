package rh.ptp.quizapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rh.ptp.quizapp.dto.*;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.service.AuthService;

import java.util.HashMap;
import java.util.Map;

/**
 * Diese Klasse stellt die REST-Endpunkte zur Authentifizierung und Autorisierung bereit.
 * Sie umfasst Funktionen für die Registrierung, E-Mail-Verifizierung, Anmeldung
 * sowie das Abrufen des aktuell eingeloggten Benutzers.
 * <p>
 * Die Endpunkte befinden sich unter dem Pfad <code>/api/auth</code>.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"$frontend.url"})
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    /**
     * Registriert einen neuen Benutzer und sendet eine E-Mail zur Verifizierung.
     *
     * @param request Das Registrierungs-Request-Objekt mit Benutzerinformationen.
     * @return Eine {@link ResponseEntity} mit einer Bestätigung oder Fehlermeldung.
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            authService.register(request);
            return ResponseEntity.ok().body(new MessageResponse("Bitte überprüfen Sie Ihre E-Mail-Adresse, um Ihre Registrierung abzuschließen."));
        } catch (RuntimeException e) {
            userRepository.delete(userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden")));
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Verifiziert die E-Mail-Adresse eines Benutzers anhand des übergebenen Tokens.
     *
     * @param token Der Verifizierungstoken, der dem Benutzer per E-Mail gesendet wurde.
     * @return Eine leere {@link ResponseEntity} mit dem Statuscode 200 bei Erfolg.
     */
    @PostMapping("/verify-email/{token}")
    public ResponseEntity<Void> verifyEmail(@PathVariable String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok().build();
    }

    /**
     * Authentifiziert einen Benutzer anhand seiner Anmeldedaten.
     *
     * @param request Das LoginRequest-Objekt mit Benutzername und Passwort.
     * @return Eine {@link ResponseEntity} mit den Authentifizierungsdaten.
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Gibt Informationen über den aktuell authentifizierten Benutzer zurück.
     *
     * @param token Der Authorization-Header mit dem JWT-Token.
     * @return Eine {@link ResponseEntity} mit den Benutzerdaten oder einer Fehlermeldung.
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String token) {
        try {
            return ResponseEntity.ok(authService.getCurrentUser(token));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Fehler beim Abrufen der Benutzerdaten."));
        }
    }

    /**
     * Globale Ausnahmebehandlung für Laufzeitfehler in diesem Controller.
     *
     * @param e Die ausgelöste {@link RuntimeException}.
     * @return Eine {@link ResponseEntity} mit einer Fehlermeldung im JSON-Format.
     */
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, String>> handleRuntimeException(RuntimeException e) {
        Map<String, String> response = new HashMap<>();
        response.put("message", e.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }
}