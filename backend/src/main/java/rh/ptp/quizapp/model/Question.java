package rh.ptp.quizapp.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

/**
 * Repräsentiert eine einzelne Quizfrage.
 * <p>
 * Eine Frage enthält den Fragetext, eine richtige Antwort, mehrere Antwortoptionen,
 * eine Schwierigkeitsstufe sowie eine optionale Quelle.
 * </p>
 */
@Entity
@Table(name = "questions")
@Data
public class Question {

    /**
     * Eindeutige ID der Frage (Primärschlüssel).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Der Fragetext.
     */
    @Column(name = "Frage")
    private String question;

    /**
     * Die korrekte Antwort auf die Frage.
     */
    @Column(name = "RichtigeAntwort")
    private String correctAnswer;

    /**
     * Schwierigkeitsgrad der Frage (z. B. 1 = leicht, 5 = schwer).
     */
    @Column(name = "Schwierigkeit")
    private int difficulty;

    /**
     * Eine Liste möglicher Antworten (z. B. bei Multiple-Choice-Fragen).
     */
    @ElementCollection
    @CollectionTable(name = "question_answers", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "Antwort")
    private List<String> answers;

    /**
     * Optionale Quelle oder Herkunft der Frage (z. B. Lehrbuch, Website).
     */
    @Column(name = "Quelle")
    private String source;

    /**
     * Standardkonstruktor.
     */
    public Question() {
    }

    /**
     * Konstruktor mit allen Eigenschaften.
     *
     * @param id            ID der Frage
     * @param question      Fragetext
     * @param correctAnswer richtige Antwort
     * @param difficulty    Schwierigkeitsgrad
     * @param answers       Antwortoptionen
     * @param source        Quelle
     */
    public Question(Long id, String question, String correctAnswer, int difficulty, List<String> answers, String source) {
        this.id = id;
        this.question = question;
        this.correctAnswer = correctAnswer;
        this.difficulty = difficulty;
        this.answers = answers;
        this.source = source;
    }
}