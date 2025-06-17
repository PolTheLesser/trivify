package rh.ptp.quizapp.dto;

import lombok.Data;

import java.util.List;

@Data
public class QuizFeedbackDTO {
    private int score;
    private int maxScore;
    private List<WrongAnswerDTO> wrongAnswers;
}