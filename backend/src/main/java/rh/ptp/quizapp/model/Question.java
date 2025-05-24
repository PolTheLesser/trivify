package rh.ptp.quizapp.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "questions")
@Data
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Frage")
    private String question;

    @Column(name = "RichtigeAntwort")
    private String correctAnswer;

    @Column(name = "Schwierigkeit")
    private int difficulty;

    @ElementCollection
    @CollectionTable(name = "question_answers", joinColumns = @JoinColumn(name = "question_id"))
    @Column(name = "Antwort")
    private List<String> answers;

    @Column(name = "Quelle")
    private String source;

    public Question() {
    }

    public Question(Long id, String question, String correctAnswer, int difficulty, List<String> answers, String source) {
        this.id = id;
        this.question = question;
        this.correctAnswer = correctAnswer;
        this.difficulty = difficulty;
        this.answers = answers;
        this.source = source;
    }
}