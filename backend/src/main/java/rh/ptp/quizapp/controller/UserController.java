package rh.ptp.quizapp.controller;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import rh.ptp.quizapp.dto.*;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.QuizFavoriteRepository;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.service.EmailService;
import rh.ptp.quizapp.service.QuizService;
import rh.ptp.quizapp.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller für Benutzerfunktionen wie Registrierung, Profilverwaltung und Favoriten.
 */
@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"$frontend.url"})
public class UserController {

    private final UserService userService;
    private final QuizService quizService;
    private final QuizFavoriteRepository quizFavoriteRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    /**
     * Versendet einen Link zum Zurücksetzen des Passworts.
     *
     * @param request E-Mail des Benutzers.
     * @return Erfolgsmeldung oder Fehler.
     */
    @PostMapping("/reset-password-request")
    public ResponseEntity<?> resetPasswordRequest(@RequestBody PasswordResetRequest request) {
        try {
            userService.forgotPassword(request.getEmail());
            return ResponseEntity.ok().body(new MessageResponse("Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Löst das Zurücksetzen des Passworts aus.
     *
     * @param email E-Mail-Adresse.
     * @return OK-Antwort.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        userService.forgotPassword(email);
        return ResponseEntity.ok().build();
    }

    /**
     * Setzt ein neues Passwort anhand eines Reset-Tokens.
     *
     * @param token   Reset-Token.
     * @param request Neues Passwort.
     * @return Erfolgsmeldung oder Fehler.
     */
    @PostMapping("/reset-password/{token}")
    public ResponseEntity<?> resetPassword(
            @PathVariable String token,
            @RequestBody ResetPasswordRequest request) {
        try {
            userService.resetPassword(token, request.getNewPassword());
            return ResponseEntity.ok().body(new MessageResponse("Passwort wurde erfolgreich zurückgesetzt."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    /**
     * Aktiviert oder deaktiviert tägliche Quiz-Erinnerungen.
     *
     * @param userId   Benutzer-ID.
     * @param reminder Erinnerungsstatus.
     * @return OK-Antwort.
     */
    @PutMapping("/{userId}/daily-quiz-reminder")
    public ResponseEntity<Void> updateDailyQuizReminder(@PathVariable Long userId, @RequestParam boolean reminder) {
        userService.updateDailyQuizReminder(userId, reminder);
        return ResponseEntity.ok().build();
    }

    /**
     * Gibt das Profil des aktuell angemeldeten Benutzers zurück.
     *
     * @param userDetails Authentifizierte Benutzerdaten.
     * @return Benutzerprofil.
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserByEmail(userDetails.getUsername()));
    }

    /**
     * Aktualisiert das Profil des Benutzers.
     *
     * @param userDetails Authentifizierte Benutzerdaten.
     * @param userDTO     Neue Profildaten.
     * @return Aktualisiertes Profil oder Fehler.
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody UserDTO userDTO) {
        try {
            User updatedUser = userService.updateProfile(userDetails.getUsername(), userDTO);
            return ResponseEntity.ok(UserDTO.fromUser(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Fehler beim Aktualisieren des Profils"));
        }
    }

    /**
     * Ändert das Passwort des Benutzers.
     *
     * @param userDetails     Authentifizierte Benutzerdaten.
     * @param currentPassword Aktuelles Passwort.
     * @param newPassword     Neues Passwort.
     * @return Erfolg oder Fehler.
     */
    @PutMapping("/profile/password")
    public ResponseEntity<?> updatePassword(@AuthenticationPrincipal UserDetails userDetails,
                                            @RequestParam String currentPassword,
                                            @RequestParam String newPassword) {
        try {
            userService.updatePassword(userDetails.getUsername(), currentPassword, newPassword);
            return ResponseEntity.ok().body(new MessageResponse("Passwort erfolgreich aktualisiert"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Fehler beim Aktualisieren des Passworts"));
        }
    }

    /**
     * Markiert den Benutzeraccount zur Löschung und sendet eine Info-Mail.
     *
     * @param userDetails Authentifizierte Benutzerdaten.
     * @return Erfolgsmeldung oder Fehler.
     */
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.getUserFromUserDetails(userDetails);
            user.setUserStatus(UserStatus.PENDING_DELETE);
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl + "/icons/logo512.png");
            variables.put("username", user.getName());
            variables.put("loginUrl", frontendUrl + "/login");
            emailService.sendEmail(user.getEmail(), "Konto zur Löschung vorgemerkt", "account-delete-info", variables);
            userRepository.save(user);
            return ResponseEntity.ok().body(new MessageResponse("Account zur Löschung vorgemerkt"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Fehler beim Löschen des Accounts: " + e.getMessage()));
        }
    }

    /**
     * Gibt alle favorisierten Quiz-IDs des Benutzers zurück.
     *
     * @param userDetails Authentifizierte Benutzerdaten.
     * @return Liste von Quiz-IDs.
     */
    @GetMapping("/favorites")
    public ResponseEntity<List<Long>> getFavoriteQuizIds(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromUserDetails(userDetails);
        List<Long> favoriteQuizIds = quizFavoriteRepository.findAllByUserId(user.getId())
                .stream()
                .map(fav -> fav.getQuiz().getId())
                .toList();
        return ResponseEntity.ok(favoriteQuizIds);
    }

    /**
     * Setzt oder entfernt ein Quiz als Favorit.
     *
     * @param quizId      Die ID des Quizzes.
     * @param userDetails Authentifizierte Benutzerdaten.
     * @return Ob das Quiz nun favorisiert ist.
     */
    @PostMapping("/quizzes/{quizId}/favorite")
    public ResponseEntity<Map<String, Boolean>> toggleFavorite(
            @PathVariable Long quizId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isFavorited = quizService.toggleFavorite(quizId, userDetails);
        return ResponseEntity.ok(Map.of("favorited", isFavorited));
    }

    /**
     * Gibt den täglichen Streak des Benutzers zurück.
     *
     * @param userDetails Authentifizierte Benutzerdaten.
     * @return Anzahl aufeinanderfolgender Tage mit erledigtem Daily Quiz.
     */
    @GetMapping("/streak")
    public int getUserStreak(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromUserDetails(userDetails);
        return user.getDailyStreak();
    }

    /**
     * Gibt die Quiz-Historie des Benutzers zurück.
     *
     * @param userDetails Authentifizierte Benutzerdaten.
     * @return Liste der abgeschlossenen Quizzes.
     */
    @GetMapping("/quiz-history")
    public ResponseEntity<List<QuizHistoryDTO>> getQuizHistory(@AuthenticationPrincipal UserDetails userDetails) {
        List<QuizHistoryDTO> history = quizService.getQuizHistory(userDetails);
        return ResponseEntity.ok(history);
    }

    /**
     * Markiert das tägliche Quiz als abgeschlossen und erhöht den Streak.
     *
     * @param userDetails Authentifizierte Benutzerdaten.
     * @return Neuer Streak-Wert.
     */
    @PostMapping("/daily-quiz/completed")
    public int completeDailyQuiz(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            return userService.incrementDailyQuizStreak(userDetails.getUsername());
        } catch (Exception e) {
            return 0;
        }
    }
}