package rh.ptp.quizapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "authentication_token")
@Data
@NoArgsConstructor
public class AuthenticationToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "Token")
    private String token;

    private LocalDateTime expiryDate;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "users_id")
    private User quizUser;

    public AuthenticationToken(User quizUser) {
        this.quizUser = quizUser;
        this.expiryDate = LocalDateTime.now().plusHours(1);
        this.token = UUID.randomUUID().toString();
    }
}
