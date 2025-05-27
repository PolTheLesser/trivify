package rh.ptp.quizapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Represents a user's favorite quiz.
 * Each entry links a user to a quiz they have marked as favorite.
 */
@Data
@Entity
@Table(name = "quiz_favorites")
public class QuizFavorite {

    /**
     * Unique identifier for the favorite entry.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The user who marked the quiz as favorite.
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * The quiz that was marked as favorite.
     */
    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    /**
     * Timestamp when the favorite was created.
     */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Sets the creation timestamp before persisting.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}