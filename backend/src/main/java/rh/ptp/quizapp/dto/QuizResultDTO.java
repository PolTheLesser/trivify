package rh.ptp.quizapp.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class QuizResultDTO {
    private Long id;
    private Long userId;
    private String username;
    private Long quizId;
    private String quizTitle;
    private int score;
    private int maxPossibleScore;
    private LocalDateTime playedAt;
    private boolean correct;
    private String userAnswer;
    private String correctAnswer;
    private String question;
    private List<String> answers;
} 