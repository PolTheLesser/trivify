package rh.ptp.quizapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import rh.ptp.quizapp.model.QuestionType;

import java.util.List;

@Data
public class QuizQuestionDTO {
    // Getters und Setters
    @Getter
    @Setter
    private Long id;

    @Setter
    @Getter
    @NotBlank(message = "Frage ist erforderlich")
    @Size(max = 1000, message = "Frage darf maximal 1000 Zeichen lang sein")
    private String question;

    @Setter
    @Getter
    @NotNull(message = "Antworten sind erforderlich")
    private List<String> answers;

    @Setter
    @Getter
    @NotBlank(message = "Richtige Antwort ist erforderlich")
    private String correctAnswer;

    @Setter
    @Getter
    @NotNull(message = "Schwierigkeitsgrad ist erforderlich")
    private int difficulty;

    @Setter
    @Getter
    private String source;

    @Setter
    @Getter
    private QuestionType questionType;

}