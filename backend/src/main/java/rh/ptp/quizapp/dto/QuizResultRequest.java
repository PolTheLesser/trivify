package rh.ptp.quizapp.dto;

import lombok.Data;

/**
 * Datenübertragungsobjekt für eine Anfrage zum Speichern eines Quiz-Ergebnisses.
 * Wird verwendet, wenn ein Benutzer ein Quiz abgeschlossen hat.
 */
@Data
public class QuizResultRequest {

    /**
     * ID des Benutzers, der das Quiz absolviert hat.
     */
    private Long userId;

    /**
     * ID des abgeschlossenen Quizzes.
     */
    private Long quizId;

    /**
     * Erzielte Punktzahl des Benutzers.
     */
    private int score;

    /**
     * Maximal mögliche Punktzahl im Quiz.
     */
    private int maxPossibleScore;
}
