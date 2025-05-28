package rh.ptp.quizapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * Repräsentiert eine Frage innerhalb eines Quizzes, einschließlich Fragetext,
 * möglicher Antworten, der richtigen Antwort und weiterer Metadaten.
 */
@Entity
@Data
@Table(name = "QUIZ_QUESTIONS")
public class QuizQuestion {

    /**
     * Eindeutige Kennung der Quizfrage.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Der Text der Frage.
     */
    @Column(nullable = false, length = 1000)
    private String question;

    /**
     * Eine Liste möglicher Antworten zur Frage.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_answers", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "answer", length = 500)
    private List<String> answers;

    /**
     * Die richtige Antwort aus der Liste der möglichen Antworten.
     */
    @Column(nullable = false)
    private String correctAnswer;

    /**
     * Schwierigkeitsgrad der Frage (z. B. 1–5).
     */
    @Column(nullable = false)
    private int difficulty;

    /**
     * Optionale Quelle oder Referenz für den Inhalt der Frage.
     */
    private String source;

    /**
     * Das Quiz, zu dem diese Frage gehört.
     */
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @ToString.Exclude
    private Quiz quiz;

    /**
     * Der Fragetyp (z. B. MULTIPLE_CHOICE).
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private QuestionType questionType = QuestionType.MULTIPLE_CHOICE;

    /**
     * Stellt sicher, dass die Antwortliste initialisiert ist und nicht null zurückgibt.
     *
     * @return die Liste der möglichen Antworten
     */
    public List<String> getAnswers() {
        if (answers == null) {
            answers = new ArrayList<>();
        }
        return answers;
    }
}