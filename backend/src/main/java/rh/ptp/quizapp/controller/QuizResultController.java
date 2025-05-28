package rh.ptp.quizapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rh.ptp.quizapp.dto.QuizResultRequest;
import rh.ptp.quizapp.dto.ScoreDTO;
import rh.ptp.quizapp.model.QuizResult;
import rh.ptp.quizapp.service.QuizResultService;
import java.util.List;
import java.util.Map;

/**
 * Controller zur Verwaltung von Quiz-Ergebnissen.
 */
@RestController
@RequestMapping("/api/quiz-results")
public class QuizResultController {

    @Autowired
    private QuizResultService quizResultService;

    /**
     * Speichert das Ergebnis eines abgeschlossenen Quiz.
     *
     * @param request Das Ergebnisobjekt mit Nutzer-ID, Quiz-ID, Punktzahl und maximaler Punktzahl.
     * @return Bestätigung der erfolgreichen Speicherung.
     */
    @PostMapping
    public ResponseEntity<?> saveResult(@RequestBody QuizResultRequest request) {
        quizResultService.saveResult(
                request.getUserId(),
                request.getQuizId(),
                request.getScore(),
                request.getMaxPossibleScore()
        );
        return ResponseEntity.ok(Map.of("message", "Ergebnis gespeichert"));
    }

    /**
     * Gibt alle Quiz-Ergebnisse eines bestimmten Benutzers zurück.
     *
     * @param userId Die ID des Benutzers.
     * @return Liste der gespeicherten Quiz-Ergebnisse.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizResult>> getUserResults(@PathVariable Long userId) {
        return ResponseEntity.ok(quizResultService.getUserResults(userId));
    }

    /**
     * Gibt alle Ergebnisse eines bestimmten Quiz zurück.
     *
     * @param quizId Die ID des Quizzes.
     * @return Liste der Ergebnisse für das Quiz.
     */
    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuizResult>> getQuizResults(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizResultService.getQuizResults(quizId));
    }

    /**
     * Gibt die Top-Benutzer nach Punktzahl zurück.
     *
     * @return Liste der besten Punktzahlen mit Rangliste.
     */
    @GetMapping("/scores/top")
    public List<ScoreDTO> getTopScores() {
        return quizResultService.getTopScores();
    }

    /**
     * Gibt die Gesamtpunktzahl und den Rang eines Benutzers zurück.
     *
     * @param userId Die ID des Benutzers.
     * @return Punktzahl und Rang des Benutzers.
     */
    @GetMapping("/scores/user/{userId}")
    public ScoreDTO getUserScore(@PathVariable Long userId) {
        return quizResultService.getUserScoreAndRank(userId);
    }
}