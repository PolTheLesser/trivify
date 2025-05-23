package rh.ptp.quizapp.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.AuthenticationTokenRepository;
import rh.ptp.quizapp.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CleanupRepositoryService {

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
     * 0) Delete all quiz results of this user
     */
    @Transactional
    public void deleteAllQuizResultsByUser(long userId) {
        em.createNativeQuery("DELETE FROM quiz_results WHERE user_id = :userId")
                .setParameter("userId", userId)
                .executeUpdate();
    }

    /**
     * 1) Delete all ratings for quizzes this user created
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
     * 2) Set all created Quizzes to admin
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

    @Scheduled(cron = "0 0 * * * *") // jede Stunde
    public void completeDeletionRequests() {
        // 1) Warn all deletion requests older than 6 days
        LocalDateTime warningTime = LocalDateTime.now().minusDays(6);
        List<User> requests = userRepository.findAllByCreatedAtBeforeAndUserStatusIn(warningTime, List.of(UserStatus.PENDING_DELETE));

        for (User request : requests) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl + "/logo192.png");
            variables.put("username", request.getName());
            variables.put("verificationUrl", frontendUrl + "/verify-email/" + authenticationTokenRepository.findTokenByQuizUser(request));
            variables.put("loginUrl", frontendUrl + "/login");
            emailService.sendEmail(request.getEmail(), "Erinnerung: Account-Löschung", "account-delete-warning", variables);
        }

        // 2) Delete all deletion requests older than 7 days
        LocalDateTime expiryTime = LocalDateTime.now().minusDays(7);
        requests = userRepository.findAllByCreatedAtBeforeAndUserStatusIn(expiryTime, List.of(UserStatus.PENDING_DELETE));
        for (User request : requests) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl + "/logo192.png");
            variables.put("username", request.getName());
            variables.put("loginUrl", frontendUrl + "/login");
            variables.put("registerUrl", frontendUrl + "/register");
            emailService.sendEmail(request.getEmail(), "Deine Benutzerdaten wurden gelöscht!", "account-deleted", variables);
        }
        userRepository.deleteAllByCreatedAtBeforeAndUserStatusIn(expiryTime, List.of(UserStatus.PENDING_DELETE));
    }

    @Scheduled(cron = "0 0 * * * *") // jede Stunde
    public void deleteOldTokens() {
        // Delete all tokens older than 1 day
        LocalDateTime expiryTime = LocalDateTime.now().minusHours(1);
        List<User> users = authenticationTokenRepository.findQuizUserByExpiryDateBefore(expiryTime);
        authenticationTokenRepository.deleteAllByExpiryDateBefore(expiryTime);
        for (User user : users) {
            if (user.getUserStatus() == UserStatus.PENDING_VERIFICATION) {
                userRepository.deleteById(user.getId());
            }
        }
    }
}
