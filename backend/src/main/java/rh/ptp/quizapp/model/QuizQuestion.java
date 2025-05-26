package rh.ptp.quizapp.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name = "QUIZ_QUESTIONS")
public class QuizQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String question;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "question_answers", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "answer", length = 500)
    private List<String> answers;

    @Column(nullable = false)
    private String correctAnswer;

    @Column(nullable = false)
    private int difficulty;

    private String source;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    @ToString.Exclude
    private Quiz quiz;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private QuestionType questionType = QuestionType.MULTIPLE_CHOICE;

    public List<String> getAnswers() {
        if (answers == null) {
            answers = new ArrayList<>();
        }
        return answers;
    }
}