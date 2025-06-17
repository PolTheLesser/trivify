package rh.ptp.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Datenübertragungsobjekt für falsche Antworten in einem Quiz.
 * Enthält die Frage, die Antwort des Benutzers und die korrekte Antwort.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class WrongAnswerDTO {
    private String question;
    private String userAnswer;
    private String correctAnswer;
}
