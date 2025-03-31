package rh.ptp.wrap.trivify.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class VerificationToken {
    private static final int EXPIRATION = 60;


    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "users_id")
    private User quizUser;

    private OffsetDateTime expiryDate;

    public VerificationToken(String token, User user) {
        this.quizUser = user;
        this.token = token;
        this.expiryDate = calculateExpiryDate(EXPIRATION);
    }

    public OffsetDateTime calculateExpiryDate(int expiryTimeInMinutes) {
        return OffsetDateTime.now().plusMinutes(expiryTimeInMinutes);
    }
}