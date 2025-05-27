package rh.ptp.quizapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

/**
 * Datenübertragungsobjekt zur Darstellung eines abgeschlossenen Quizdurchlaufs.
 * Enthält Informationen über das Quiz, die erreichte Punktzahl und den Zeitpunkt.
 */
@Data
public class QuizHistoryDTO {

    /**
     * Eindeutige ID dieses Quizdurchlaufs.
     */
    private Long id;

    /**
     * ID des gespielten Quizzes.
     */
    private Long quizId;

    /**
     * Titel des gespielten Quizzes.
     */
    private String quizTitle;

    /**
     * Erzielte Punktzahl.
     */
    private int score;

    /**
     * Maximal erreichbare Punktzahl im Quiz.
     */
    private int maxPossibleScore;

    /**
     * Zeitstempel, wann das Quiz gespielt wurde.
     */
    private LocalDateTime playedAt;

    /**
     * Schwierigkeitsgrad des Quizzes (optional).
     */
    private String difficulty;

    /**
     * Kategorie des Quizzes (optional).
     */
    private String category;

    /**
     * Gibt an, ob es sich bei dem Quiz um das tägliche Quiz handelt.
     */
    private boolean isDailyQuiz;
}
