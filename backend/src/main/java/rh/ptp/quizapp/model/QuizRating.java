package rh.ptp.quizapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Repräsentiert eine Bewertung, die ein Benutzer für ein Quiz abgegeben hat.
 */
@Data
@Entity
@Table(name = "quiz_ratings")
public class QuizRating {

    /**
     * Eindeutige ID der Bewertung.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * ID des Benutzers, der die Bewertung abgegeben hat.
     * (Keine direkte Beziehung zur User-Entität.)
     */
    @Column(nullable = false)
    private Long userId;

    /**
     * Das bewertete Quiz.
     */
    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    /**
     * Bewertungswert (z. B. auf einer Skala von 1 bis 5).
     */
    @Column(nullable = false)
    private int rating;

    /**
     * Optionaler Kommentar des Benutzers zur Bewertung.
     */
    @Column(length = 1000)
    private String comment;

    /**
     * Zeitpunkt, zu dem die Bewertung erstellt wurde.
     */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Wird automatisch vor dem Speichern gesetzt, um das Erstellungsdatum zu erfassen.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}