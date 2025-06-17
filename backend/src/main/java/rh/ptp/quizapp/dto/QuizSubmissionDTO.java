package rh.ptp.quizapp.dto;

import lombok.Data;

import java.util.Map;

/**
 * Datenübertragungsobjekt für die Einreichung von Quiz-Antworten.
 * Enthält die ID des Quizzes und eine Map, die die Antworten des Benutzers
 * zu den jeweiligen Fragen speichert.
 */
@Data
public class QuizSubmissionDTO {
    private Long quizId;
    private Map<Long, String> answers;
}
