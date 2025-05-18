package rh.ptp.quizapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;
import rh.ptp.quizapp.model.QuizCategory;

import java.util.ArrayList;
import java.util.List;

@Data
@Setter
@Getter
public class QuizDTO {
    // Getters und Setters
    private Long id;

    @NotBlank(message = "Titel ist erforderlich")
    @Size(max = 100, message = "Titel darf maximal 100 Zeichen lang sein")
    private String title;

    @Size(max = 1000, message = "Beschreibung darf maximal 1000 Zeichen lang sein")
    private String description;

    @NotNull(message = "Fragen sind erforderlich")
    private List<QuizQuestionDTO> questions;

    private boolean isPublic;
    private List<QuizCategory> categories = new ArrayList<>();
    private boolean isDailyQuiz;
    private Long creatorId;
    private String creatorUsername;
    private Double avgRating;
    private Long   ratingCount;


    public boolean isDailyQuiz() {
        return categories.contains(QuizCategory.DAILY_QUIZ);
    }

    public void setDailyQuiz(boolean isDailyQuiz) {
        if(isDailyQuiz) {
            categories.add(QuizCategory.DAILY_QUIZ);
        } else {
            categories.remove(QuizCategory.DAILY_QUIZ);
        }
    }
}