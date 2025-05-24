package rh.ptp.quizapp.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserRole;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Objects;

@Service
public class AdminService {
    @Autowired
    private PasswordEncoder passwordEncoder;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private EmailService emailService;

    @Value("${frontend.url}")
    private String frontendUrl;

    private boolean customEmailSend = false;

    public User createUser(User user) {
        adminEmail(user, user, 0);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        return user;
    }

    public User updateUser(Long id, User userUpdated) {
        User user = userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
        Map<String, Object> variables = adminEmail(user, userUpdated, 1);
        if (userUpdated.getName() != null) {
            user.setName(userUpdated.getName());
        }

        if (userUpdated.getEmail() != null) {
            user.setEmail(userUpdated.getEmail());
        }

        if (user.getPassword() != null) {
            user.setPassword(passwordEncoder.encode(user.getPassword()));
        }

        if (userUpdated.getUserStatus() != null) {
            user.setUserStatus(userUpdated.getUserStatus());
        }

        if (userUpdated.getRole() != null) {
            user.setRole(userUpdated.getRole());
        }
        user.setDailyQuizReminder(userUpdated.isDailyQuizReminder());

        if (userUpdated.getDailyStreak() != user.getDailyStreak()) {
            user.setLastDailyQuizPlayed(LocalDateTime.now());
        }

        user.setDailyStreak(userUpdated.getDailyStreak());

        user.setUpdatedAt(LocalDateTime.now());

        userRepository.save(user);
        if (!customEmailSend) {
            variables.replace("username", user.getName());
            variables.replace("email", user.getEmail());
            emailService.sendEmail(user.getEmail(), "Dein Benutzerkonto wurde durch einen Admin aktualisiert!", "account-updated", variables);
        }
        return user;
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id).get();
        try {
            adminEmail(user, user, 2);
            userRepository.deleteById(id);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private Map<String, Object> adminEmail(User user, User userUpdated, int action) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("logoUrl", frontendUrl + "/logo192.png");
        variables.put("username", userUpdated.getName());
        variables.put("loginUrl", frontendUrl + "/login");
        variables.put("password", userUpdated.getPassword());
        variables.put("registerUrl", frontendUrl + "/register");
        if (action == 0) {
            emailService.sendEmail(user.getEmail(), "Dein Benutzerkonto wurde durch einen Admin erstellt!", "account-created", variables);
        } else if (action == 1) {
            if (userUpdated.getRole() != null && userUpdated.getRole().equals(UserRole.ROLE_ADMIN) && !user.getRole().equals(UserRole.ROLE_ADMIN)) {
                emailService.sendEmail(user.getEmail(), "Du wurdest zum Admin ernannt!", "admin-promoted", variables);
                customEmailSend = true;
            } else if (userUpdated.getRole() != null && !userUpdated.getRole().equals(UserRole.ROLE_ADMIN) && user.getRole().equals(UserRole.ROLE_ADMIN)) {
                emailService.sendEmail(user.getEmail(), "Du wurdest zum normalen Benutzer degradiert!", "admin-demoted", variables);
                customEmailSend = true;
            }
            if (user.getUserStatus() != UserStatus.BLOCKED && userUpdated.getUserStatus() == UserStatus.BLOCKED) {
                emailService.sendEmail(user.getEmail(), "Dein Benutzerkonto wurde durch einen Admin gesperrt!", "account-blocked", variables);
                customEmailSend = true;
            } else if (user.getUserStatus() == UserStatus.BLOCKED && userUpdated.getUserStatus() != UserStatus.BLOCKED) {
                emailService.sendEmail(user.getEmail(), "Deine Benutzersperre wurde durch einen Admin aufgehoben!", "account-unblocked", variables);
                customEmailSend = true;
            }
            if (!Objects.equals(passwordEncoder.encode(userUpdated.getPassword()), user.getPassword())) {
                emailService.sendEmail(user.getEmail(), "Dein Passwort wurde durch einen Admin geändert!", "password-changed", variables);
                customEmailSend = true;
            }
        } else if (action == 2) {
            emailService.sendEmail(user.getEmail(), "Dein Benutzerkonto wurde durch einen Admin gelöscht!", "account-deleted", variables);
        }
        return variables;
    }
}
