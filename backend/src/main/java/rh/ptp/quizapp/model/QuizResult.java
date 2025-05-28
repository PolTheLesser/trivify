package rh.ptp.quizapp.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Repräsentiert das Ergebnis eines Benutzers nach Abschluss eines Quizzes.
 */
@Entity
@Table(name = "quiz_results")
@Data
public class QuizResult {

    /**
     * Eindeutige ID des Quiz-Ergebnisses.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Der Benutzer, der das Quiz gespielt hat.
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Das absolvierte Quiz.
     */
    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    /**
     * Erzielte Punktzahl des Benutzers.
     */
    @Column(nullable = false)
    private int score;

    /**
     * Maximale erreichbare Punktzahl des Quizzes.
     */
    @Column(nullable = false)
    private int maxPossibleScore;

    /**
     * Zeitpunkt, an dem das Quiz gespielt wurde.
     */
    @Column(nullable = false)
    private LocalDateTime playedAt;

    /**
     * Wird automatisch vor dem Speichern gesetzt, um das Spielzeit-Datum zu erfassen.
     */
    @PrePersist
    protected void onCreate() {
        playedAt = LocalDateTime.now();
    }
}