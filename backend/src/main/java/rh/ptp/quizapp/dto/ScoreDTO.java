package rh.ptp.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Datenübertragungsobjekt zur Darstellung von Spielergebnissen und Rankings.
 */
@Data
@AllArgsConstructor
public class ScoreDTO {

    /**
     * Benutzername des Spielers.
     */
    private String username;

    /**
     * Erzielte Punktzahl des Spielers.
     */
    private int score;

    /**
     * Rang des Spielers (optional).
     */
    private int rank;

    /**
     * Konstruktor ohne Rang (rank).
     *
     * @param username Benutzername
     * @param score    Punktzahl
     */
    public ScoreDTO(String username, int score) {
        this.username = username;
        this.score = score;
    }
}
