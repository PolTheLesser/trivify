package rh.ptp.quizapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.dto.UserDTO;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final CleanupRepositoryService cleanupRepo;
    private final QuizResultRepository     quizResultRepo;
    private final UserRepository           userRepo;
    private final Logger log = LoggerFactory.getLogger(UserService.class);
    private final QuizResultRepository quizResultRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Ungültiges Passwort");
        }

        if (!user.isEmailVerified()) {
            throw new RuntimeException("E-Mail-Adresse nicht verifiziert");
        }

        return user;
    }

    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
        
        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordTokenExpiry(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        Map<String, Object> variables = new HashMap<>();
        variables.put("username", user.getName());
        variables.put("resetUrl", frontendUrl + "/reset-password/" + token);

        emailService.sendEmail(user.getEmail(), "Passwort zurücksetzen", "password-reset-email", variables);
    }

    public void resetPassword(String token, String newPassword) {
        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new RuntimeException("Ungültiger oder abgelaufener Token"));

        if (user.getResetPasswordTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Der Token ist abgelaufen");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordTokenExpiry(null);
        userRepository.save(user);
    }

    public void deleteAccount(Long userId) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("username", userRepository.findUserById(userId).getName());
        emailService.sendEmail(userRepository.findUserById(userId).getEmail(), "Konto gelöscht", "account-deleted", variables);
        // a) Cleanup aller element‑tables und parent‑tables per Native SQL
        cleanupRepo.deleteAllQuizRatingsByUser(userId);
        cleanupRepo.deleteAllQuestionAnswersByUser(userId);
        cleanupRepo.deleteAllQuizQuestionsByUser(userId);
        cleanupRepo.deleteAllQuizzesByUser(userId);

        // b) Ergebnisse (falls separat verlinkt)
        quizResultRepo.deleteAllByUserId(userId);

        // c) User selbst zuletzt
        userRepo.deleteById(userId);
    }

    public void updateDailyQuizReminder(Long userId, boolean reminder) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
        user.setDailyQuizReminder(reminder);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
    }

    public User updateProfile(String email, UserDTO userDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setDailyQuizReminder(userDTO.isDailyQuizReminder());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    public void updatePassword(String email, String currentPassword, String newPassword) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Aktuelles Passwort ist falsch");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public int incrementDailyQuizStreak(String email) {
        LocalDate today = LocalDate.now();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden"));
        log.info("Incrementing daily quiz streak for user: {}", user.getEmail());
        boolean alreadyPlayedToday = quizResultRepository
                .existsByUserIdAndQuizIsDailyQuizTrueAndPlayedAtAfter(user.getId(), today.atStartOfDay());
        user.setLastDailyQuizPlayed(LocalDateTime.now());

        if (alreadyPlayedToday) {
            userRepository.save(user);
            return user.getDailyStreak();
        }
        user.setDailyStreak(user.getDailyStreak() + 1);
        log.info("New daily quiz streak: {}", user.getDailyStreak());
        userRepository.save(user);
        return user.getDailyStreak();
    }

    public User getUserFromUserDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("UserDetails cannot be null");
        }

        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + userDetails.getUsername()));
    }
}