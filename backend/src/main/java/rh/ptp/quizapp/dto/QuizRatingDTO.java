package rh.ptp.quizapp.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.Data;

@Data
public class QuizRatingDTO {
    private Long   quizId;

    @Min(1) @Max(5)
    private int    rating;

    // optional in Response:
    private Double avgRating;
    private Long   ratingCount;
    // + Getter/Setter
}
