/*package rh.ptp.wrap.trivify.model.entity;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;

@Entity
@Data
public class UserQuizStats {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private int highestScore;

    private double fastestCompletionTime;

    private int attemptsTaken;

    private OffsetDateTime lastAttemptedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id")
    private Quiz quiz;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;
}*/