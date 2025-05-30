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
import rh.ptp.quizapp.model.QuizCategory;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

import lombok.RequiredArgsConstructor;

/**
 * Service zur Verwaltung von Benutzeroperationen wie Registrierung, Passwortänderung und Profilaktualisierung.
 */
@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final Logger log = LoggerFactory.getLogger(UserService.class);
    private final QuizResultRepository quizResultRepository;
    private final AuthenticationTokenRepository authenticationTokenRepository;
    private final AuthService authService;

    @Value("${frontend.url}")
    private String frontendUrl;

    /**
     * Sendet eine Passwort-Zurücksetzen-Mail an den Benutzer.
     *
     * @param email E-Mail-Adresse des Benutzers.
     */
    public void forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

        authService.createAuthenticationToken(user);
        String token = authenticationTokenRepository.findTokenByQuizUser(user);
        Map<String, Object> variables = new HashMap<>();
        variables.put("logoUrl", frontendUrl + "/icons/logo512.png");
        variables.put("username", user.getName());
        variables.put("resetUrl", frontendUrl + "/reset-password/" + token);

        emailService.sendEmail(user.getEmail(), "Passwort zurücksetzen", "password-reset-email", variables);
    }

    /**
     * Setzt das Passwort mit einem gültigen Token zurück.
     *
     * @param token       Reset-Token.
     * @param newPassword Neues Passwort.
     */
    public void resetPassword(String token, String newPassword) {
        User user = authenticationTokenRepository.findQuizUserByToken(token)
                .orElseThrow(() -> new RuntimeException("Ungültiger oder abgelaufener Token"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setUserStatus(UserStatus.ACTIVE);
        authenticationTokenRepository.deleteAllById(user.getId());
        userRepository.save(user);
    }

    /**
     * Aktualisiert, ob ein Benutzer Erinnerungen für das tägliche Quiz erhalten möchte.
     *
     * @param userId   ID des Benutzers.
     * @param reminder true = aktiv, false = deaktiviert.
     */
    public void updateDailyQuizReminder(Long userId, boolean reminder) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
        user.setDailyQuizReminder(reminder);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    /**
     * Holt einen Benutzer anhand der E-Mail.
     *
     * @param email E-Mail-Adresse.
     * @return Benutzer-Entity.
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
    }

    /**
     * Aktualisiert das Profil eines Benutzers.
     *
     * @param email   E-Mail des Benutzers.
     * @param userDTO Neue Benutzerdaten.
     * @return Aktualisierter Benutzer.
     */
    public User updateProfile(String email, UserDTO userDTO) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setDailyQuizReminder(userDTO.isDailyQuizReminder());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Aktualisiert das Passwort eines Benutzers.
     *
     * @param email           E-Mail-Adresse des Benutzers.
     * @param currentPassword Aktuelles Passwort des Benutzers.
     * @param newPassword     Neues Passwort des Benutzers.
     */
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

    /**
     * Erhöht die tägliche Quiz-Serie für einen Benutzer um eins, wenn er das tägliche Quiz noch nicht gespielt hat.
     *
     * @param email E-Mail-Adresse des Benutzers.
     * @return Neue Streak-Länge.
     */
    public int incrementDailyQuizStreak(String email) {
        LocalDate today = LocalDate.now();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden"));
        log.info("Incrementing daily quiz streak for user: {}", user.getEmail());
        boolean alreadyPlayedToday = quizResultRepository
                .existsByUserIdAndQuizCategoriesAndPlayedAtAfter(user.getId(), QuizCategory.DAILY_QUIZ, today.atStartOfDay());
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

    /**
     * Holt einen Benutzer aus den UserDetails.
     *
     * @param userDetails UserDetails-Objekt.
     * @return Benutzer-Entity.
     * @throws IllegalArgumentException  wenn userDetails null ist.
     * @throws UsernameNotFoundException wenn der Benutzer nicht gefunden wird.
     */
    public User getUserFromUserDetails(UserDetails userDetails) {
        if (userDetails == null) {
            throw new IllegalArgumentException("UserDetails cannot be null");
        }

        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with username: " + userDetails.getUsername()));
    }
}