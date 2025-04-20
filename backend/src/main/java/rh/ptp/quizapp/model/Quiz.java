package rh.ptp.quizapp.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;

@Data
@Entity
@Table(name = "quizzes")
@Setter
@Getter
public class Quiz {
    // Getters und Setters
    
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
    @Setter
    private boolean isDailyQuiz = false;
    
    
    @Column(name = "quiz_date")
    private LocalDate date;
    
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Double avgRating;
    private Long   ratingCount;

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }

    public boolean isDailyQuiz() {
        return isDailyQuiz;
    }

    public void setDailyQuiz(boolean isDailyQuiz) {
        this.isDailyQuiz = isDailyQuiz;
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