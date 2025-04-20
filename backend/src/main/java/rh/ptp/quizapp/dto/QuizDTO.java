package rh.ptp.quizapp.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Data
@Setter
@Getter
public class QuizDTO {
    private Long id;

    @NotBlank(message = "Titel ist erforderlich")
    @Size(max = 100, message = "Titel darf maximal 100 Zeichen lang sein")
    private String title;

    @Size(max = 1000, message = "Beschreibung darf maximal 1000 Zeichen lang sein")
    private String description;

    @NotNull(message = "Fragen sind erforderlich")
    private List<QuizQuestionDTO> questions;

    private boolean isPublic;
    private boolean isDailyQuiz;
    private Long creatorId;
    private String creatorUsername;
    private Double avgRating;
    private Long   ratingCount;


    // Getters und Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public boolean isDailyQuiz() {
        return isDailyQuiz;
    }

    public void setDailyQuiz(boolean isDailyQuiz) {
        this.isDailyQuiz = isDailyQuiz;
    }

    public List<QuizQuestionDTO> getQuestions() {
        return questions;
    }

    public void setQuestions(List<QuizQuestionDTO> questions) {
        this.questions = questions;
    }
} 