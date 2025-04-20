package rh.ptp.quizapp.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class QuizResultRequest {
    private Long userId;
    private Long quizId;
    private int score;
    private int maxPossibleScore;
}