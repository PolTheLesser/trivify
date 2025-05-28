package rh.ptp.quizapp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

/**
 * Datenübertragungsobjekt für die Bewertung eines Quizzes.
 * Enthält die Bewertung und optionale Auswertungsinformationen.
 */
@Data
public class QuizRatingDTO {

    /**
     * ID des bewerteten Quizzes.
     */
    private Long quizId;

    /**
     * Bewertung zwischen 1 und 5.
     */
    @Min(1)
    @Max(5)
    private int rating;

    /**
     * Durchschnittliche Bewertung des Quizzes (optional, wird meist in der Antwort verwendet).
     */
    private Double avgRating;

    /**
     * Anzahl der abgegebenen Bewertungen (optional).
     */
    private Long ratingCount;
}

