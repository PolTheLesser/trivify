package rh.ptp.quizapp.controller;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import rh.ptp.quizapp.dto.*;
import rh.ptp.quizapp.model.QuestionType;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.repository.QuizRepository;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.service.QuizService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class QuizController {
    private Logger logger = LoggerFactory.getLogger(QuizController.class);
    @Autowired
    private QuizService quizService;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private QuizRepository quizRepository;

    @GetMapping("/quizzes")
    public ResponseEntity<List<Quiz>> getQuizzes() {
        List<Quiz> quizze = quizService.findAllWithRatings();
        for (Quiz quiz : quizze) {
            for (int i = 0; i < quiz.getQuestions().size(); i++) {
                quiz.getQuestions().get(i).setCorrectAnswer("Nicht cheaten ;)");
            }
            quiz.getCreator().setEmail(null);
            quiz.getCreator().setPassword(null);
        }
        logger.debug(quizze.toString());
        return ResponseEntity.ok(quizze);
    }

    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long quizId) {
        Quiz quiz = quizService.getQuizById(quizId);
        if (quiz != null) {
            for (int i = 0; i < quiz.getQuestions().size(); i++) {
                quiz.getQuestions().get(i).setCorrectAnswer("Nicht cheaten ;)");
            }
            quiz.getCreator().setEmail(null);
            quiz.getCreator().setPassword(null);
            return ResponseEntity.ok(quiz);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/toEdit/{quizId}")
    public ResponseEntity<Quiz> getQuiztoEdit(@PathVariable Long quizId) {
        Quiz quiz = quizService.getQuizById(quizId);
        if (quiz != null) {
            return ResponseEntity.ok(quiz);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@Valid @RequestBody QuizDTO quizDTO, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).get().getId();
        validateQuizDTO(quizDTO);
        return ResponseEntity.ok(quizService.createQuiz(quizDTO, userId));
    }

    @PutMapping("/{quizId}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long quizId, @Valid @RequestBody QuizDTO quizDTO, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).get().getId();
        validateQuizDTO(quizDTO);
        return ResponseEntity.ok(quizService.updateQuiz(quizId, quizDTO, userId));
    }

    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).get().getId();
        quizService.deleteQuiz(quizId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Quiz>> getUserQuizzes(@PathVariable Long userId) {
        return ResponseEntity.ok(quizService.getUserQuizzes(userId));
    }

    @GetMapping("/daily")
    public ResponseEntity<QuizDTO> getDailyQuiz() {
        try {
            QuizDTO quiz = quizService.getDailyQuiz();
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/daily/completion-status")
    public ResponseEntity<Map<String, Boolean>> getDailyQuizCompletionStatus(@RequestParam Long userId) {
        boolean completed = quizService.hasCompletedDailyQuiz(userId);
        return ResponseEntity.ok(Map.of("completed", completed));
    }


    @PostMapping("/{quizId}/submit")
    public ResponseEntity<QuizResultDTO> submitAnswer(@PathVariable Long quizId, @RequestBody AnswerDTO answerDto) {
        logger.info("QuizID: {} - Empfange Antwort für FrageID: {}", quizId, answerDto.getQuestionId());
        try {
            QuizResultDTO result = quizService.checkAnswer(answerDto.getQuestionId(), answerDto.getAnswer());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Fehler beim Überprüfen der Antwort: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/quizzes/{quizId}/rate")
    public ResponseEntity<Integer> rateQuiz(
            @PathVariable Long quizId,
            @Valid @RequestBody QuizRatingDTO ratingDTO, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).get().getId();
        if (quizRepository.findByQuizId(quizId).getCreator().getId().equals(userId)) {
            throw new RuntimeException("Du kannst dein eigenes Quiz nicht bewerten");
        }
        return ResponseEntity.ok(quizService.rateQuiz(quizId, userId, ratingDTO.getRating()));
    }

    private void validateQuizDTO(QuizDTO quizDTO) {
        if (quizDTO.getTitle() == null || quizDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Titel darf nicht leer sein");
        }

        for (int i = 0; i < quizDTO.getQuestions().size(); i++) {
            QuizQuestionDTO q = quizDTO.getQuestions().get(i);

            if (q.getQuestion() == null || q.getQuestion().trim().isEmpty()) {
                throw new IllegalArgumentException("Frage " + (i + 1) + " ist leer");
            }

            if (q.getCorrectAnswer() == null || q.getCorrectAnswer().trim().isEmpty()) {
                throw new IllegalArgumentException("Richtige Antwort fehlt bei Frage " + (i + 1));
            }

            if (q.getQuestionType() != QuestionType.TEXT_INPUT) {
                if (q.getAnswers() == null || q.getAnswers().isEmpty() || q.getAnswers().stream().anyMatch(a -> a == null || a.trim().isEmpty())) {
                    throw new IllegalArgumentException("Alle Antwortmöglichkeiten müssen bei Frage " + (i + 1) + " ausgefüllt sein");
                }

                if (!q.getAnswers().contains(q.getCorrectAnswer())) {
                    throw new IllegalArgumentException("Richtige Antwort ist bei Frage " + (i + 1) + " nicht unter den gegebenen Antworten");
                }
            }
        }
    }

} 