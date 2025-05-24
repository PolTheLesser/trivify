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

@Data
@Entity
@Table(name = "quizzes")
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;


    @Column(nullable = false)
    private String title;


    @Column(length = 1000)
    private String description;


    @ManyToOne
    @JoinColumn(name = "creator_id", nullable = false)
    private User creator;


    @JsonManagedReference
    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<QuizQuestion> questions;

    private boolean isPublic = true;

    @ElementCollection
    @Size(max = 3)
    @CollectionTable(name = "quiz_categories", joinColumns = @JoinColumn(name = "quiz_id"))
    @Column(name = "category")
    private List<QuizCategory> categories = new ArrayList<>();


    @Column(name = "quiz_date")
    private LocalDate date;


    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double avgRating;
    private Long ratingCount;

    public boolean isDailyQuiz() {
        return categories.contains(QuizCategory.DAILY_QUIZ);
    }

    public void setDailyQuiz(boolean isDailyQuiz) {
        if (isDailyQuiz) {
            if (!categories.contains(QuizCategory.DAILY_QUIZ)) {
                categories.add(QuizCategory.DAILY_QUIZ);
            } else {
                categories.remove(QuizCategory.DAILY_QUIZ);
            }
        }
    }

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}