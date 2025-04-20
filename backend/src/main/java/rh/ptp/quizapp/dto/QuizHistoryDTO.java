package rh.ptp.quizapp.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class QuizHistoryDTO {
    private Long id;
    private Long quizId;
    private String quizTitle;
    private int score;
    private int maxPossibleScore;
    private LocalDateTime playedAt;
    
    // Optional: Weitere Felder für zusätzliche Informationen
    private String difficulty;
    private String category;
    private boolean isDailyQuiz;
} 