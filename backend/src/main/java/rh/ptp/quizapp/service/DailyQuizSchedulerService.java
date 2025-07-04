package rh.ptp.quizapp.service;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.QuizCategory;
import rh.ptp.quizapp.repository.QuizRepository;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.util.CreateAiRequest;

import java.io.IOException;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service zur automatischen Erstellung und Speicherung eines täglichen Quiz.
 * <p>
 * Die Methode {@link #generateDailyQuiz()} wird einmal täglich um 0:00 Uhr ausgeführt.
 * </p>
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DailyQuizSchedulerService {

    /**
     * Hilfsklasse zum Erstellen von API-Anfragen für Quizdaten.
     */
    @Autowired
    private CreateAiRequest createAiRequest;

    private final QuizRepository quizRepository;
    private final QuizService quizService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserRepository userRepository;

    @Value("${frontend.url}")
    private String frontendUrl;

    /**
     * Wird beim Start der Anwendung ausgeführt und prüft, ob ein neues Quiz generiert werden muss.
     */
    @PostConstruct
    public void checkAndGenerateQuizOnStart() {
        log.info("Prüfe beim Start, ob ein tägliches Quiz generiert werden muss");
        generateDailyQuiz();
    }

    /**
     * Tägliche Aufgabe, die automatisch um 0:00 Uhr ausgeführt wird.
     * <p>
     * Diese Methode generiert 10 Quizfragen über eine API-Abfrage und speichert sie.
     * Im Fehlerfall wird ein Logeintrag erzeugt.
     * </p>
     * <p>
     * Cron-Ausdruck: {@code 0 0 0 * * *} (täglich um 0:00 Uhr)
     * </p>
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void generateDailyQuiz() {
        log.info("Starte tägliche Quiz-Generierung");

        try {
            LocalDate today = LocalDate.now();
            if (!quizRepository.findByCategoriesAndDate(QuizCategory.DAILY_QUIZ, today).isEmpty()) {
                log.info("Quiz für heute existiert bereits");
                return;
            }

            QuizCategory[] categories = java.util.Arrays.stream(QuizCategory.values())
                    .filter(cat -> cat != QuizCategory.DAILY_QUIZ && cat != QuizCategory.GENERAL_KNOWLEDGE)
                    .toArray(QuizCategory[]::new);
            QuizCategory randomCategory = categories[(int) (Math.random() * categories.length)];
            JSONArray fragen = createAiRequest.fetchQuizFromAPI(randomCategory.getDisplayName());

            quizService.updateDailyQuiz(fragen, randomCategory);

            log.info("Tägliches Quiz wurde aktualisiert");

            List<User> users = userRepository.findAll();
            Map<String, Object> variables = new HashMap<>();
            variables.put("quizUrl", frontendUrl + "/daily-quiz");
            variables.put("logoUrl", frontendUrl + "/icons/logo512.png");
            LocalDate yesterday = LocalDate.now().minusDays(1);

            for (User user : users) {
                LocalDate lastPlayed = user.getLastDailyQuizPlayed() != null
                        ? user.getLastDailyQuizPlayed().toLocalDate()
                        : null;
                boolean missedYesterday = (lastPlayed == null || !lastPlayed.equals(yesterday))
                        && !quizRepository.findByCategoriesAndDate(QuizCategory.DAILY_QUIZ, yesterday).isEmpty();
                variables.put("username", user.getName());
                if (user.getDailyStreak() > 0 && missedYesterday) {
                    int oldStreak = user.getDailyStreak();
                    log.info("User {} hat zuletzt gespielt am: {} und verliert seine Streak.", user.getId(), lastPlayed);
                    user.setDailyStreak(0);
                    userRepository.save(user);
                    if (user.isDailyQuizReminder()) {
                        variables.put("oldStreak", oldStreak);
                        emailService.sendEmail(user.getEmail(), "Daily-Streak verloren 😔", "daily-quiz-streak-lost", variables);
                    }
                } else if (user.isDailyQuizReminder()) {
                    emailService.sendEmail(user.getEmail(), "Tägliche Quiz-Erinnerung ⁉️", "daily-quiz-reminder", variables);
                }
            }
        } catch (Exception e) {
            log.error("Fehler bei der Generierung des täglichen Quiz: {}", e.getMessage());
        }
    }

    /**
     * Tägliche Erinnerung an Benutzer um 18 Uhr, falls die Daily-Streak in Gefahr ist.
     * <p>
     * Cron-Ausdruck: {@code 0 0 18 * * ?} (täglich um 18 Uhr)
     * </p>
     */
    @Scheduled(cron = "0 0 18 * * ?")
    public void dailyQuizStreakReminder() {
        for (User user : userRepository.findByDailyQuizReminderIsTrue()) {
            LocalDate lastPlayed = user.getLastDailyQuizPlayed() != null
                    ? user.getLastDailyQuizPlayed().toLocalDate()
                    : null;
            boolean missedUntilNow = lastPlayed == null || lastPlayed.isBefore(LocalDate.now());
            if (user.getDailyStreak() > 0 && missedUntilNow) {
                Map<String, Object> variables = new HashMap<>();
                variables.put("logoUrl", frontendUrl + "/icons/logo512.png");
                variables.put("username", user.getName());
                variables.put("quizUrl", frontendUrl + "/daily-quiz");
                variables.put("streak", user.getDailyStreak());
                variables.put("logoUrl", frontendUrl + "/icons/logo512.png");
                emailService.sendEmail(user.getEmail(), "Deine Streak ist in Gefahr! ⏳", "daily-quiz-streak-reminder", variables);
            }
        }
    }
}

