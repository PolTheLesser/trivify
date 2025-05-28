package rh.ptp.quizapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import rh.ptp.quizapp.dto.ScoreDTO;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.model.QuizResult;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.repository.QuizResultRepository;
import rh.ptp.quizapp.repository.QuizRepository;
import rh.ptp.quizapp.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Service zur Verwaltung von Quiz-Ergebnissen.
 * <p>
 * Bietet Methoden zum Speichern von Ergebnissen, Abrufen von Ergebnissen
 * für Nutzer und Quiz sowie zum Berechnen von Top-Scores und Rankings.
 * </p>
 */
@Service
public class QuizResultService {

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizRepository quizRepository;

    private final Logger log = LoggerFactory.getLogger(QuizResultService.class);

    /**
     * Speichert ein Quiz-Ergebnis für einen Benutzer und ein Quiz.
     *
     * @param userId           ID des Benutzers
     * @param quizId           ID des Quiz
     * @param score            erreichte Punktzahl
     * @param maxPossibleScore maximale Punktzahl des Quiz
     * @return gespeichertes QuizResult-Objekt
     * @throws RuntimeException wenn Benutzer oder Quiz nicht gefunden werden
     */
    public QuizResult saveResult(Long userId, Long quizId, int score, int maxPossibleScore) {
        log.info("️ Speichere QuizResult für userId=" + userId + ", quizId=" + quizId);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
        log.info("Benutzer gefunden: " + user.getUsername());

        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz nicht gefunden"));
        log.info("Quiz gefunden: " + quiz.getTitle());

        QuizResult result = new QuizResult();
        result.setUser(user);
        result.setQuiz(quiz);
        result.setScore(score);
        result.setMaxPossibleScore(maxPossibleScore);
        result.setPlayedAt(LocalDateTime.now());

        QuizResult saved = quizResultRepository.save(result);
        log.info("QuizResult gespeichert, ID: " + saved.getId());
        return saved;
    }

    /**
     * Gibt alle Quiz-Ergebnisse eines bestimmten Benutzers zurück.
     *
     * @param userId ID des Benutzers
     * @return Liste der Quiz-Ergebnisse
     */
    public List<QuizResult> getUserResults(Long userId) {
        return quizResultRepository.findByUserId(userId);
    }

    /**
     * Gibt alle Ergebnisse für ein bestimmtes Quiz zurück.
     *
     * @param quizId ID des Quiz
     * @return Liste der Quiz-Ergebnisse
     */
    public List<QuizResult> getQuizResults(Long quizId) {
        return quizResultRepository.findByQuizId(quizId);
    }

    /**
     * Liefert die Top 10 Scores aller Benutzer zurück.
     *
     * @return Liste von ScoreDTO mit Benutzername, Score und Platzierung (-1 als Platzhalter)
     */
    public List<ScoreDTO> getTopScores() {
        List<Object[]> rawResults = quizResultRepository.findTopUserScores(PageRequest.of(0, 10));

        return rawResults.stream()
                .map(entry -> {
                    Long userId = (Long) entry[0];
                    Integer score = ((Number) entry[1]).intValue();
                    String username = userRepository.findById(userId)
                            .map(User::getName)
                            .orElse("Unbekannt");
                    return new ScoreDTO(username, score, -1); // Platz wird hier nicht beachtet
                })
                .toList();
    }

    /**
     * Liefert den Score und das Ranking eines Benutzers zurück.
     *
     * @param userId ID des Benutzers
     * @return ScoreDTO mit Benutzername, Score und Rang, oder Platz -1 wenn nicht gefunden
     */
    public ScoreDTO getUserScoreAndRank(Long userId) {
        List<Object[]> ordered = quizResultRepository.findAllUserScoresOrdered();
        int rank = 1;
        for (Object[] entry : ordered) {
            Long id = (Long) entry[0];
            Long score = (Long) entry[1];
            log.info(">> RankingEntry: userId=" + id + " | score=" + score);

            if (id != null && id.equals(userId)) {
                int s = score.intValue();
                String username = userRepository.findById(userId).map(User::getName).orElse("Unbekannt");
                return new ScoreDTO(username, s, rank);
            }
            rank++;
        }

        return new ScoreDTO("Unbekannt", 0, -1);
    }
}