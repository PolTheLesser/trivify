package rh.ptp.quizapp.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.model.RegistrationRequest;
import rh.ptp.quizapp.repository.RegistrationRequestRepository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CleanupRepositoryService {

    @PersistenceContext
    private EntityManager em;

    @Autowired
    private RegistrationRequestRepository registrationRequestRepository;
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
    @Scheduled(cron = "0 0 * * * *") // jede Stunde //ToDo: implement account status, implement rest of mails
    public void cleanupOldRegistrations() {
        LocalDateTime warningTime = LocalDateTime.now().minusHours(23);
        List<RegistrationRequest> requests = registrationRequestRepository.findAllByCreatedAtBefore(warningTime);
        for (RegistrationRequest request : requests) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl + "/logo192.png");
            variables.put("username", request.getName());
            variables.put("verificationUrl", frontendUrl + "/verify-email/" + request.getVerificationToken());
            variables.put("loginUrl", frontendUrl + "/login");
            //if(user.status="registration"){
            emailService.sendEmail(request.getEmail(), "Erinnerung: Registrierung", "registration-delete-warning", variables);
            //} else{
            //    emailService.sendEmail(request.getEmail(), "Erinnerung: Account-Löschung", "account-delete-warning", variables); }
        }
        LocalDateTime expiryTime = LocalDateTime.now().minusHours(24);
        requests = registrationRequestRepository.findAllByCreatedAtBefore(expiryTime);
        for (RegistrationRequest request : requests) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl+"/logo192.png");
            variables.put("username", request.getName());
        }
        registrationRequestRepository.deleteAllByCreatedAtBefore(expiryTime);
    }
}
