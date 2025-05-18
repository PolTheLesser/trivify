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
import rh.ptp.quizapp.service.AccountCleanupService;
import rh.ptp.quizapp.service.EmailService;
import rh.ptp.quizapp.service.QuizService;
import rh.ptp.quizapp.service.UserService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"$frontend.url"})
public class UserController {

    private final UserService userService;
    private final QuizService quizService;
    private final AccountCleanupService accountCleanupService;
    private final QuizFavoriteRepository quizFavoriteRepository;
    private final EmailService emailService;
    private final UserRepository userRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    @PostMapping("/reset-password-request")
    public ResponseEntity<?> resetPasswordRequest(@RequestBody PasswordResetRequest request) {
        try {
            userService.forgotPassword(request.getEmail());
            return ResponseEntity.ok().body(new MessageResponse("Eine E-Mail zum Zurücksetzen des Passworts wurde gesendet."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestParam String email) {
        userService.forgotPassword(email);
        return ResponseEntity.ok().build();
    }

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


    @PutMapping("/{userId}/daily-quiz-reminder")
    public ResponseEntity<Void> updateDailyQuizReminder(@PathVariable Long userId, @RequestParam boolean reminder) {
        userService.updateDailyQuizReminder(userId, reminder);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(userService.getUserByEmail(userDetails.getUsername()));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(@AuthenticationPrincipal UserDetails userDetails, @Valid @RequestBody UserDTO userDTO) {
        try {
            User updatedUser = userService.updateProfile(userDetails.getUsername(), userDTO);
            return ResponseEntity.ok(UserDTO.fromUser(updatedUser));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Fehler beim Aktualisieren des Profils"));
        }
    }

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

    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteProfile(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            User user = userService.getUserFromUserDetails(userDetails);
            user.setUserStatus(UserStatus.PENDING_DELETE);
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl + "/logo192.png");
            variables.put("username",  user.getName());
            variables.put("loginUrl", frontendUrl + "/login");
            emailService.sendEmail(user.getEmail(), "Konto zur Löschung vorgemerkt", "account-delete-info", variables);
            userRepository.save(user);
            return ResponseEntity.ok().body(new MessageResponse("Account zur Löschung vorgemerkt"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new MessageResponse("Fehler beim Löschen des Accounts: "+e.getMessage()));
        }
    }

    @GetMapping("/favorites")
    public ResponseEntity<List<Long>> getFavoriteQuizIds(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromUserDetails(userDetails);
        List<Long> favoriteQuizIds = quizFavoriteRepository.findAllByUserId(user.getId())
                .stream()
                .map(fav -> fav.getQuiz().getId())
                .toList();
        return ResponseEntity.ok(favoriteQuizIds);
    }

    @PostMapping("/quizzes/{quizId}/favorite")
    public ResponseEntity<Map<String, Boolean>> toggleFavorite(
            @PathVariable Long quizId,
            @AuthenticationPrincipal UserDetails userDetails) {
        boolean isFavorited = quizService.toggleFavorite(quizId, userDetails);
        return ResponseEntity.ok(Map.of("favorited", isFavorited));
    }

    @GetMapping("/streak")
    public int getUserStreak(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userService.getUserFromUserDetails(userDetails);
        return user.getDailyStreak();
    }

    @GetMapping("/quiz-history")
    public ResponseEntity<List<QuizHistoryDTO>> getQuizHistory(@AuthenticationPrincipal UserDetails userDetails) {
        List<QuizHistoryDTO> history = quizService.getQuizHistory(userDetails);
        return ResponseEntity.ok(history);
    }

    @PostMapping("/daily-quiz/completed")
    public int completeDailyQuiz(@AuthenticationPrincipal UserDetails userDetails) {
        try {
            return userService.incrementDailyQuizStreak(userDetails.getUsername());
        } catch (Exception e) {
            return 0;
        }
    }
} 