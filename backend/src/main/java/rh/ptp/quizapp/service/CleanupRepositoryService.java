package rh.ptp.quizapp.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.model.AuthenticationToken;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.AuthenticationTokenRepository;
import rh.ptp.quizapp.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service zur Bereinigung und Löschung von Benutzerdaten und Tokens.
 * <p>
 * Führt geplante Aufgaben wie das Löschen alter Tokens und das Abschließen von Löschanfragen durch.
 * </p>
 */
@Service
public class CleanupRepositoryService {

    private final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(CleanupRepositoryService.class);

    @PersistenceContext
    private EntityManager em;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthenticationTokenRepository authenticationTokenRepository;

    @Autowired
    private EmailService emailService;

    @Value("${frontend.url}")
    private String frontendUrl;

    /**
     * Löscht alle Quiz-Ergebnisse eines Benutzers.
     *
     * @param userId ID des Benutzers
     */
    @Transactional
    public void deleteAllQuizResultsByUser(long userId) {
        em.createNativeQuery("DELETE FROM quiz_results WHERE user_id = :userId")
                .setParameter("userId", userId)
                .executeUpdate();
    }

    /**
     * Löscht alle Bewertungen für die vom Benutzer erstellten Quizzes.
     *
     * @param userId ID des Benutzers
     */
    @Transactional
    public void deleteAllQuizRatingsByUser(long userId) {
        em.createNativeQuery(
                        "DELETE FROM quiz_ratings " +
                                " WHERE quiz_id IN ( " +
                                "   SELECT id FROM quizzes WHERE creator_id = :userId" +
                                ")"
                )
                .setParameter("userId", userId)
                .executeUpdate();
    }

    /**
     * Setzt den Ersteller aller vom Benutzer erstellten Quizzes auf den Admin-Benutzer (ID = 1).
     *
     * @param userId ID des Benutzers
     */
    @Transactional
    public void setAllCreatedQuizzesToAdmin(long userId) {
        em.createNativeQuery(
                        "UPDATE quizzes SET creator_id = 1 " +
                                " WHERE creator_id = :userId"
                )
                .setParameter("userId", userId)
                .executeUpdate();
    }

    /**
     * Bereitet die Löschung eines Benutzers vor, indem abhängige Datensätze bereinigt werden.
     *
     * @param userId ID des Benutzers
     */
    @Transactional
    public void prepareDelete(long userId) {
        deleteAllQuizResultsByUser(userId);
        deleteAllQuizRatingsByUser(userId);
        setAllCreatedQuizzesToAdmin(userId);
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));
        AuthenticationToken token = authenticationTokenRepository.findByQuizUser(user);
        if (token != null) {
            authenticationTokenRepository.delete(token);
        }
        deleteOldTokens();
    }

    /**
     * Führt geplante Aufgaben zum Abschluss von Löschanfragen aus.
     * <ul>
     *   <li>Warnung an Benutzer mit Löschanfragen älter als 6 Tage.</li>
     *   <li>Endgültige Löschung von Benutzerdaten für Löschanfragen älter als 7 Tage.</li>
     * </ul>
     * <p>
     * Ausgeführt jede Stunde (Cron: "0 0 * * * *").
     * </p>
     */
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void completeDeletionRequests() {
        LocalDateTime warningTime = LocalDateTime.now().minusDays(6);
        List<User> requests = userRepository.findAllByCreatedAtBeforeAndUserStatusIn(warningTime, List.of(UserStatus.PENDING_DELETE));

        for (User request : requests) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl + "/icons/logo512.png");
            variables.put("username", request.getName());
            variables.put("verificationUrl", frontendUrl + "/verify-email/" + authenticationTokenRepository.findTokenByQuizUser(request));
            variables.put("loginUrl", frontendUrl + "/login");
            emailService.sendEmail(request.getEmail(), "Erinnerung: Account-Löschung", "account-delete-warning", variables);
        }

        LocalDateTime expiryTime = LocalDateTime.now().minusDays(7);
        requests = userRepository.findAllByCreatedAtBeforeAndUserStatusIn(expiryTime, List.of(UserStatus.PENDING_DELETE));
        for (User request : requests) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl + "/icons/logo512.png");
            variables.put("username", request.getName());
            variables.put("loginUrl", frontendUrl + "/login");
            variables.put("registerUrl", frontendUrl + "/register");
            emailService.sendEmail(request.getEmail(), "Deine Benutzerdaten wurden gelöscht!", "account-deleted", variables);
            prepareDelete(request.getId());
        }
        userRepository.deleteAllByCreatedAtBeforeAndUserStatusIn(expiryTime, List.of(UserStatus.PENDING_DELETE));
    }

    /**
     * Löscht alte Authentifizierungstoken, die älter als 1 Stunde sind.
     * <p>
     * Löscht auch Benutzer mit Status PENDING_VERIFICATION, wenn deren Token abgelaufen sind.
     * </p>
     * <p>
     * Ausgeführt jede Minute (Cron: "0 * * * * *").
     * </p>
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void deleteOldTokens() {
        LocalDateTime expiryTime = LocalDateTime.now().minusHours(1);
        List<User> users = authenticationTokenRepository.findQuizUserByExpiryDateBefore(expiryTime);
        authenticationTokenRepository.deleteAllByExpiryDateBefore(expiryTime);
        for (User user : users) {
            if (user.getUserStatus() == UserStatus.PENDING_VERIFICATION) {
                logger.info("Deleting user {} with status PENDING_VERIFICATION", user.getEmail());
                userRepository.deleteById(user.getId());
            }
        }
    }
}