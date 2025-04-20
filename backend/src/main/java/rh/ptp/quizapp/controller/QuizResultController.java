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

@RestController
@RequestMapping("/api/quiz-results")
public class QuizResultController {

    @Autowired
    private QuizResultService quizResultService;

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


    @GetMapping("/user/{userId}")
    public ResponseEntity<List<QuizResult>> getUserResults(@PathVariable Long userId) {
        return ResponseEntity.ok(quizResultService.getUserResults(userId));
    }

    @GetMapping("/quiz/{quizId}")
    public ResponseEntity<List<QuizResult>> getQuizResults(@PathVariable Long quizId) {
        return ResponseEntity.ok(quizResultService.getQuizResults(quizId));
    }

    @GetMapping("/scores/top")
    public List<ScoreDTO> getTopScores() {
        return quizResultService.getTopScores();
    }

    @GetMapping("/scores/user/{userId}")
    public ScoreDTO getUserScore(@PathVariable Long userId) {
        return quizResultService.getUserScoreAndRank(userId);
    }
} 