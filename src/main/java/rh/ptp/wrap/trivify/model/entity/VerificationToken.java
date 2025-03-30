package rh.ptp.wrap.trivify.model.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.OffsetDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class VerificationToken {
    private static final int EXPIRATION = 60;


    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    private OffsetDateTime expiryDate;

    public OffsetDateTime calculateExpiryDate(int expiryTimeInMinutes) {
        return OffsetDateTime.now().plusMinutes(expiryTimeInMinutes);
    }
}