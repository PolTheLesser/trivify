package rh.ptp.quizapp.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

/**
 * Repräsentiert ein vom Benutzer als Favorit markiertes Quiz.
 * Jeder Eintrag verknüpft einen Benutzer mit einem Quiz, das er als Favorit markiert hat.
 */
@Data
@Entity
@Table(name = "quiz_favorites")
public class QuizFavorite {

    /**
     * Eindeutige Kennung für den Favoriten-Eintrag.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Der Benutzer, der das Quiz als Favorit markiert hat.
     */
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /**
     * Das Quiz, das als Favorit markiert wurde.
     */
    @ManyToOne
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    /**
     * Zeitstempel, wann der Favorit erstellt wurde.
     */
    @Column(nullable = false)
    private LocalDateTime createdAt;

    /**
     * Setzt den Erstellungs-Zeitstempel vor dem Persistieren.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}