package rh.ptp.quizapp.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Datenübertragungsobjekt zur Darstellung des Ergebnisses einer beantworteten Frage
 * oder eines gesamten Quizdurchlaufs.
 * Enthält Benutzer-, Quiz- und Bewertungsinformationen.
 */
@Data
public class QuizResultDTO {

    /**
     * Eindeutige ID des Ergebniseintrags.
     */
    private Long id;

    /**
     * ID des Benutzers, der das Quiz gespielt hat.
     */
    private Long userId;

    /**
     * Benutzername des Spielers.
     */
    private String username;

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
     * Maximal mögliche Punktzahl.
     */
    private int maxPossibleScore;

    /**
     * Zeitpunkt, zu dem das Quiz gespielt wurde.
     */
    private LocalDateTime playedAt;

    /**
     * Gibt an, ob die Antwort korrekt war (bei Einzel-Fragen).
     */
    private boolean correct;

    /**
     * Antwort, die der Benutzer abgegeben hat.
     */
    private String userAnswer;

    /**
     * Die korrekte Antwort auf die Frage.
     */
    private String correctAnswer;

    /**
     * Die Frage, auf die sich das Ergebnis bezieht.
     */
    private String question;

    /**
     * Die Antwortmöglichkeiten zur Frage.
     */
    private List<String> answers;
}
