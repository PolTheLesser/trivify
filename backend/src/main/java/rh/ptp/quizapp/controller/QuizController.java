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
import org.springframework.web.server.ResponseStatusException;
import rh.ptp.quizapp.dto.*;
import rh.ptp.quizapp.model.*;
import rh.ptp.quizapp.repository.QuizRepository;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.service.QuizService;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

/**
 * Dieser Controller verwaltet alle Operationen im Zusammenhang mit Quiz-Objekten.
 * Dazu gehören das Erstellen, Bearbeiten, Löschen, Abrufen und Bewerten von Quizzes.
 */
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

    /**
     * Gibt alle Quizzes zurück, bei denen das tägliche Quiz von heute ausgefiltert wird.
     *
     * @return Eine Liste von {@link Quiz}-Objekten.
     */
    @GetMapping("/quizzes")
    public ResponseEntity<List<Quiz>> getQuizzes() {
        List<Quiz> quizze = quizService.findAllWithRatings();
        LocalDate today = LocalDate.now();

        quizze.removeIf(quiz -> quiz.isDailyQuiz() && today.equals(quiz.getDate()));

        for (Quiz quiz : quizze) {
            for (int i = 0; i < quiz.getQuestions().size(); i++) {
                quiz.getQuestions().get(i).setCorrectAnswer(""); // Setzt die korrekte Antwort auf null, um sie nicht anzuzeigen
            }
            quiz.getCreator().setEmail(null);
            quiz.getCreator().setPassword(null);
        }
        logger.debug(quizze.toString());
        return ResponseEntity.ok(quizze);
    }

    /**
     * Gibt ein einzelnes Quiz anhand der ID zurück. Beim heutigen täglichen Quiz wird die {@link #getDailyQuiz()}-Methode aufgerufen.
     *
     * @param quizId Die ID des Quizzes.
     * @return Das entsprechende {@link Quiz}-Objekt oder 404.
     */
    @GetMapping("/{quizId}")
    public ResponseEntity<Quiz> getQuiz(@PathVariable Long quizId) {
        Quiz quiz = quizService.getQuizById(quizId);
        if (quiz != null) {
            if (quiz.isDailyQuiz() && quiz.getDate().equals(LocalDate.now())) {
                getDailyQuiz();
            }
            for (int i = 0; i < quiz.getQuestions().size(); i++) {
                quiz.getQuestions().get(i).setCorrectAnswer(""); // Setzt die korrekte Antwort auf null, um sie nicht anzuzeigen
            }
            quiz.getCreator().setEmail(null);
            quiz.getCreator().setPassword(null);
            return ResponseEntity.ok(quiz);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * Gibt ein Quiz zurück, das vom Benutzer bearbeitet werden darf.
     * Nur der Ersteller oder ein Admin darf dieses bearbeiten.
     *
     * @param quizId       Die ID des Quizzes.
     * @param userDetails  Die Authentifizierungsdaten des Benutzers.
     * @return Das Quiz oder ein Fehlerstatus.
     */
    @GetMapping("/toEdit/{quizId}")
    public ResponseEntity<Quiz> getQuiztoEdit(@PathVariable Long quizId,
                                               @AuthenticationPrincipal UserDetails userDetails) {
        Quiz quiz = quizService.getQuizById(quizId);
        if (quiz == null) {
            return ResponseEntity.notFound().build();
        }

        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Benutzer nicht gefunden"));
        boolean isAdmin = user.getRole() == UserRole.ROLE_ADMIN;
        boolean isCreator = quiz.getCreator().getEmail().equals(userDetails.getUsername());

        if (isAdmin || isCreator) {
            return ResponseEntity.ok(quiz);
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
    }

    /**
     * Erstellt ein neues Quiz.
     *
     * @param quizDTO      Die Daten des Quizzes.
     * @param userDetails  Die Authentifizierungsdaten des Erstellers.
     * @return Das erstellte {@link Quiz}-Objekt.
     */
    @PostMapping
    public ResponseEntity<Quiz> createQuiz(@Valid @RequestBody QuizDTO quizDTO, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).get().getId();
        quizService.validateQuizDTO(quizDTO);
        return ResponseEntity.ok(quizService.createQuiz(quizDTO, userId));
    }

    /**
     * Aktualisiert ein bestehendes Quiz.
     *
     * @param quizId       Die ID des Quizzes.
     * @param quizDTO      Die aktualisierten Daten.
     * @param userDetails  Die Authentifizierungsdaten.
     * @return Das aktualisierte {@link Quiz}-Objekt.
     */
    @PutMapping("/{quizId}")
    public ResponseEntity<Quiz> updateQuiz(@PathVariable Long quizId, @Valid @RequestBody QuizDTO quizDTO, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).get().getId();
        quizService.validateQuizDTO(quizDTO);
        return ResponseEntity.ok(quizService.updateQuiz(quizId, quizDTO, userId));
    }

    /**
     * Löscht ein Quiz anhand der ID.
     *
     * @param quizId       Die ID des zu löschenden Quizzes.
     * @param userDetails  Die Authentifizierungsdaten.
     * @return Eine leere {@link ResponseEntity} bei Erfolg.
     */
    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@PathVariable Long quizId, @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = userRepository.findByEmail(userDetails.getUsername()).get().getId();
        quizService.deleteQuiz(quizId, userId);
        return ResponseEntity.ok().build();
    }

    /**
     * Gibt alle Quizzes eines bestimmten Benutzers zurück.
     *
     * @param userId Die ID des Benutzers.
     * @return Eine Liste der {@link Quiz}-Objekte.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Quiz>> getUserQuizzes(@PathVariable Long userId) {
        return ResponseEntity.ok(quizService.getUserQuizzes(userId));
    }

    /**
     * Gibt das tägliche Quiz zurück.
     *
     * @return Das tägliche {@link QuizDTO}-Objekt.
     */
    @GetMapping("/daily")
    public ResponseEntity<QuizDTO> getDailyQuiz() {
        try {
            QuizDTO quiz = quizService.getDailyQuiz();
            return ResponseEntity.ok(quiz);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Überprüft, ob der Benutzer das tägliche Quiz bereits abgeschlossen hat.
     *
     * @param userId Die Benutzer-ID.
     * @return Ein JSON mit dem Boolean-Wert "completed".
     */
    @GetMapping("/daily/completion-status")
    public ResponseEntity<Map<String, Boolean>> getDailyQuizCompletionStatus(@RequestParam Long userId) {
        boolean completed = quizService.hasCompletedDailyQuiz(userId);
        return ResponseEntity.ok(Map.of("completed", completed));
    }

    /**
     * Übermittelt eine Antwort auf eine Quizfrage und überprüft diese.
     *
     * @param quizId    Die ID des Quizzes.
     * @param answerDto Die gegebene Antwort.
     * @return Das Ergebnis als {@link QuizResultDTO}.
     */
    @PostMapping("/{quizId}/submit")
    public ResponseEntity<QuizResultDTO> submitAnswer(@PathVariable Long quizId, @RequestBody AnswerDTO answerDto) {
        logger.info("QuizID: {} - Empfange Antwort für FrageID: {}", quizId, answerDto.getQuestionId());
        try {
            QuizResultDTO result = quizService.checkAnswer(answerDto.getQuestionId(), answerDto.getAnswer());
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            logger.error("Fehler beim Überprüfen der Antwort: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Ermöglicht einem Benutzer, ein Quiz zu bewerten, sofern er nicht der Ersteller ist.
     *
     * @param quizId       Die ID des zu bewertenden Quizzes.
     * @param ratingDTO    Die Bewertungsdaten.
     * @param userDetails  Die Authentifizierungsdaten des Benutzers.
     * @return Die neue durchschnittliche Bewertung.
     */
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
} 
