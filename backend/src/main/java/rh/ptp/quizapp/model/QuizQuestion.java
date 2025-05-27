package rh.ptp.quizapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

/**
 * Represents a question within a quiz, including its text,
 * possible answers, correct answer, and metadata.
 */
@Entity
@Data
@Table(name = "QUIZ_QUESTIONS")
public class QuizQuestion {

    /**
     * Unique identifier for the quiz question.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The text of the question.
     */
    @Column(nullable = false, length = 1000)
    private String question;

    /**
     * A list of possible answers for the question.
     */
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_answers", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "answer", length = 500)
    private List<String> answers;

    /**
     * The correct answer from the list of possible answers.
     */
    @Column(nullable = false)
    private String correctAnswer;

    /**
     * Difficulty level of the question (e.g., 1–5).
     */
    @Column(nullable = false)
    private int difficulty;

    /**
     * Optional source or reference for the question content.
     */
    private String source;

    /**
     * The quiz this question belongs to.
     */
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @ToString.Exclude
    private Quiz quiz;

    /**
     * The type of the question (e.g., MULTIPLE_CHOICE).
     */
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private QuestionType questionType = QuestionType.MULTIPLE_CHOICE;

    /**
     * Ensures the answer list is initialized and not null.
     *
     * @return the list of possible answers
     */
    public List<String> getAnswers() {
        if (answers == null) {
            answers = new ArrayList<>();
        }
        return answers;
    }
}