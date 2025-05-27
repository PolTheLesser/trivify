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

/**
 * Datenübertragungsobjekt für ein Quiz.
 * Enthält Informationen wie Titel, Beschreibung, Fragen, Kategorien und Ersteller.
 */
@Data
@Setter
@Getter
public class QuizDTO {

    /**
     * Eindeutige ID des Quizzes.
     */
    private Long id;

    /**
     * Titel des Quizzes.
     * Muss angegeben werden und darf maximal 100 Zeichen enthalten.
     */
    @NotBlank(message = "Titel ist erforderlich")
    @Size(max = 100, message = "Titel darf maximal 100 Zeichen lang sein")
    private String title;

    /**
     * Optionale Beschreibung des Quizzes.
     * Darf maximal 1000 Zeichen lang sein.
     */
    @Size(max = 1000, message = "Beschreibung darf maximal 1000 Zeichen lang sein")
    private String description;

    /**
     * Liste der Fragen im Quiz.
     * Muss angegeben werden und darf nicht null sein.
     */
    @NotNull(message = "Fragen sind erforderlich")
    private List<QuizQuestionDTO> questions;

    /**
     * Gibt an, ob das Quiz öffentlich sichtbar ist.
     */
    private boolean isPublic;

    /**
     * Kategorien, denen das Quiz zugeordnet ist.
     */
    private List<QuizCategory> categories = new ArrayList<>();

    /**
     * Gibt an, ob es sich um das tägliche Quiz handelt.
     */
    private boolean isDailyQuiz;

    /**
     * ID des Erstellers des Quizzes.
     */
    private Long creatorId;

    /**
     * Benutzername des Erstellers.
     */
    private String creatorUsername;

    /**
     * Durchschnittliche Bewertung des Quizzes.
     */
    private Double avgRating;

    /**
     * Anzahl der abgegebenen Bewertungen.
     */
    private Long ratingCount;

    /**
     * Prüft, ob das Quiz zur Kategorie "Tägliches Quiz" gehört.
     *
     * @return true, wenn es ein tägliches Quiz ist, sonst false
     */
    public boolean isDailyQuiz() {
        return categories.contains(QuizCategory.DAILY_QUIZ);
    }

    /**
     * Legt fest, ob das Quiz ein tägliches Quiz ist.
     * Fügt die Kategorie hinzu oder entfernt sie entsprechend.
     *
     * @param isDailyQuiz true, wenn es ein tägliches Quiz sein soll, sonst false
     */
    public void setDailyQuiz(boolean isDailyQuiz) {
        if (isDailyQuiz) {
            categories.add(QuizCategory.DAILY_QUIZ);
        } else {
            categories.remove(QuizCategory.DAILY_QUIZ);
        }
    }
}
