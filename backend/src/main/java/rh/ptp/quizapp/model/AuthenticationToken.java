package rh.ptp.quizapp.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Repräsentiert ein Authentifizierungs-Token, das einem Benutzer zugewiesen wird.
 * <p>
 * Dieses Token kann zur Validierung von Sitzungen oder API-Anfragen verwendet werden
 * und enthält Informationen zur Gültigkeit sowie zur zugehörigen Benutzerinstanz.
 * </p>
 */
@Entity
@Table(name = "authentication_token")
@Data
@NoArgsConstructor
public class AuthenticationToken {

    /**
     * Eindeutige ID des Tokens (Primärschlüssel, auto-generiert).
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Der tatsächliche Token-String, z. B. ein UUID-Wert.
     */
    @Column(name = "Token")
    private String token;

    /**
     * Ablaufzeitpunkt des Tokens. Nach Ablauf ist das Token ungültig.
     */
    private LocalDateTime expiryDate;

    /**
     * Der Benutzer, dem dieses Token zugeordnet ist.
     * Es handelt sich um eine 1:1-Beziehung zu einem User-Objekt.
     */
    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "users_id")
    private User quizUser;

    /**
     * Konstruktor, der automatisch ein Token generiert und eine Ablaufzeit von 1 Stunde setzt.
     *
     * @param quizUser Der Benutzer, für den das Token erstellt wird
     */
    public AuthenticationToken(User quizUser) {
        this.quizUser = quizUser;
        this.expiryDate = LocalDateTime.now().plusHours(1);
        this.token = UUID.randomUUID().toString();
    }
}
