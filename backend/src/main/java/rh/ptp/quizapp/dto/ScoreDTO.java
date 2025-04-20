package rh.ptp.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ScoreDTO {
    private String username;
    private int score;
    private int rank;
    public ScoreDTO(String username, int score) {
        this.username = username;
        this.score = score;
    }

}
