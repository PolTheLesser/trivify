package rh.ptp.quizapp.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

/**
 * Repräsentiert ein Quiz, das aus mehreren Fragen besteht.
 * <p>
 * Ein Quiz hat einen Titel, eine Beschreibung, einen Ersteller (User), Fragen,
 * Kategorien, Sichtbarkeit und Bewertungsinformationen.
 * </p>
 */
@Data
@Entity
@Table(name = "quizzes")
public class Quiz {

    /**
     * Eindeutige ID des Quizzes (Primärschlüssel).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Titel des Quizzes.
     */
    @Column(nullable = false)
    private String title;

    /**
     * Beschreibung des Quizzes.
     */
    @Column(length = 1000)
    private String description;

    /**
     * Ersteller des Quizzes.
     */
    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;

    /**
     * Liste der Fragen im Quiz.
     */
    @JsonManagedReference
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<QuizQuestion> questions;

    /**
     * Gibt an, ob das Quiz öffentlich sichtbar ist.
     */
    private boolean isPublic = true;

    /**
     * Kategorien des Quizzes (max. 3), z. B. DAILY_QUIZ oder andere.
     */
    @ElementCollection
    @Size(max = 3)
    @CollectionTable(name = "quiz_categories", joinColumns = @JoinColumn(name = "quiz_id"))
    @Column(name = "category")
    private List<QuizCategory> categories = new ArrayList<>();

    /**
     * Datum, an dem das Quiz zugewiesen oder veröffentlicht wurde.
     */
    @Column(name = "quiz_date")
    private LocalDate date;

    /**
     * Erstellungszeitpunkt des Quizzes.
     */
    private LocalDateTime createdAt;

    /**
     * Zeitpunkt der letzten Aktualisierung.
     */
    private LocalDateTime updatedAt;

    /**
     * Durchschnittliche Bewertung des Quizzes.
     */
    private Double avgRating;

    /**
     * Anzahl der abgegebenen Bewertungen.
     */
    private Long ratingCount;

    /**
     * Prüft, ob das Quiz als "Tagesquiz" (DAILY_QUIZ) gekennzeichnet ist.
     *
     * @return true, wenn DAILY_QUIZ enthalten ist
     */
    public boolean isDailyQuiz() {
        return categories.contains(QuizCategory.DAILY_QUIZ);
    }

    /**
     * Fügt die Kategorie DAILY_QUIZ hinzu oder entfernt sie je nach Status.
     *
     * @param isDailyQuiz true, um DAILY_QUIZ zu aktivieren, false zum Entfernen
     */
    public void setDailyQuiz(boolean isDailyQuiz) {
        if (isDailyQuiz) {
            if (!categories.contains(QuizCategory.DAILY_QUIZ)) {
                categories.add(QuizCategory.DAILY_QUIZ);
            } else {
                categories.remove(QuizCategory.DAILY_QUIZ);
            }
        }
    }

    /**
     * Wird vor dem Speichern aufgerufen und setzt Erstellungs- und Änderungszeitpunkt.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Wird vor dem Update aufgerufen und aktualisiert den Änderungszeitpunkt.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}