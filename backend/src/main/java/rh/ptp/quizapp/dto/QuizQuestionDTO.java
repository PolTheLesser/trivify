package rh.ptp.quizapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import rh.ptp.quizapp.model.QuestionType;

import java.util.List;

/**
 * Datenübertragungsobjekt für eine einzelne Quizfrage.
 * Enthält Frage, Antwortmöglichkeiten, richtige Antwort, Schwierigkeitsgrad und weitere Metadaten.
 */
@Data
public class QuizQuestionDTO {

    /**
     * Eindeutige ID der Frage.
     */
    private Long id;

    /**
     * Der Fragetext.
     * Muss angegeben werden und darf maximal 1000 Zeichen enthalten.
     */
    @NotBlank(message = "Frage ist erforderlich")
    @Size(max = 1000, message = "Frage darf maximal 1000 Zeichen lang sein")
    private String question;

    /**
     * Liste aller möglichen Antworten.
     * Muss angegeben werden.
     */
    @NotNull(message = "Antworten sind erforderlich")
    private List<String> answers;

    /**
     * Die korrekte Antwort.
     * Muss angegeben werden.
     */
    @NotBlank(message = "Richtige Antwort ist erforderlich")
    private String correctAnswer;

    /**
     * Schwierigkeitsgrad der Frage (z. B. 1 = leicht, 2 = mittel, 3 = schwer).
     * Muss angegeben werden.
     */
    @NotNull(message = "Schwierigkeitsgrad ist erforderlich")
    private int difficulty;

    /**
     * Quelle der Frage (optional), z. B. Wikipedia-Link oder Buchverweis.
     */
    private String source;

    /**
     * Typ der Frage, z. B. Multiple Choice oder Wahr/Falsch.
     */
    private QuestionType questionType;
}
