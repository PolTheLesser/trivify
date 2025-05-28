package rh.ptp.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Datenübertragungsobjekt für eine gegebene Antwort auf eine Frage.
 * Enthält die ID der Frage und die Antwort des Benutzers.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnswerDTO {
    private Long questionId;
    private String answer;
}
