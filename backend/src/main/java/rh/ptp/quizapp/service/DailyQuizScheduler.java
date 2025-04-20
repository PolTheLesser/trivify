package rh.ptp.quizapp.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONArray;
import org.json.JSONException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.repository.QuizRepository;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.util.CreateAiRequest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import jakarta.annotation.PostConstruct;

/**
 * Service zur automatischen Erstellung und Speicherung eines täglichen Quiz.
 * <p>
 * Die Methode {@link #generateDailyQuiz()} wird einmal täglich um 0:00 Uhr ausgeführt
 * und speichert ein generiertes Quiz im JSON-Format unter {@code src/main/resources/daily.json}.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DailyQuizScheduler {

    /**
     * Hilfsklasse zum Erstellen von API-Anfragen für Quizdaten.
     */
    @Autowired
    private CreateAiRequest createAiRequest;

    private final QuizRepository quizRepository;
    private final QuizService quizService;

    /**
     * Pfad zur Daily-Quiz-Datei.
     */
    private static final Path DAILY_QUIZ_PATH = Paths.get("src/main/resources/daily.json");
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
     * Diese Methode generiert 10 Quizfragen über eine API-Abfrage und speichert sie als JSON-Datei.
     * Im Fehlerfall wird ein entsprechender Logeintrag erzeugt.
     * <p>
     * Cron-Ausdruck: {@code 0 0 0 * * *} (täglich um 0:00 Uhr)
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void generateDailyQuiz() {
        log.info("Starte tägliche Quiz-Generierung");

        try {
            LocalDate today = LocalDate.now();
            if (!quizRepository.findByIsDailyQuizTrueAndDate(today).isEmpty()) {
                log.info("Quiz für heute existiert bereits");
                return;
            }

            JSONArray fragen = null;
            boolean valid = false;

            while (!valid) {
                try {
                    fragen = createAiRequest.fetchQuizFromAPI();
                    valid = true;
                } catch (IOException | InterruptedException | JSONException ignored) {
                    log.warn("Invalid JSON-Format, retrying...");
                }
            }

            quizService.updateDailyQuiz(fragen); // Übergib direkt statt von Datei zu lesen

            log.info("Tägliches Quiz wurde aktualisiert");

            List<User> usersToRemind = userRepository.findByDailyQuizReminderIsNotNull();
            Map<String, Object> variables = new HashMap<>();
            variables.put("quizUrl", frontendUrl + "/daily-quiz");

            for (User user : usersToRemind) {
                variables.put("username", user.getName());
                emailService.sendEmail(user.getEmail(), "Tägliche Quiz-Erinnerung", "daily-quiz-reminder", variables);
            }

        } catch (Exception e) {
            log.error("Fehler bei der Generierung des täglichen Quiz: {}", e.getMessage());
        }
    }
}

