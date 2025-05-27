package rh.ptp.quizapp.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Repräsentiert einen Benutzer des Systems.
 * Implementiert Spring Security's {@link UserDetails} zur Authentifizierung und Autorisierung.
 */
@Getter
@Setter
@Entity
@Table(name = "users")
@Accessors(chain = true)
public class User implements UserDetails {

    /**
     * Eindeutige ID des Benutzers.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Name des Benutzers.
     */
    @Getter
    @Column(nullable = false)
    private String name;

    /**
     * Eindeutige E-Mail-Adresse des Benutzers (wird auch als Benutzername verwendet).
     */
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * Passwort des Benutzers (verschlüsselt).
     */
    @Column(nullable = false)
    private String password;

    /**
     * Aktueller Status des Benutzers (z.B. aktiv, blockiert).
     */
    @Column(nullable = false)
    private UserStatus userStatus = UserStatus.PENDING_VERIFICATION;

    /**
     * Rolle des Benutzers (z.B. Benutzer, Admin).
     */
    @Column(nullable = false, name = "role", columnDefinition = "user_role")
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.ROLE_USER;

    /**
     * Gibt an, ob der Benutzer tägliche Quiz-Erinnerungen erhalten möchte.
     */
    @Column(nullable = false)
    private boolean dailyQuizReminder = false;

    /**
     * Anzahl der aufeinanderfolgenden Tage, an denen der Benutzer ein Quiz gespielt hat.
     */
    @Getter
    @Setter
    private int dailyStreak = 0;

    /**
     * Zeitpunkt des letzten gespielten täglichen Quiz.
     */
    private LocalDateTime lastDailyQuizPlayed;

    /**
     * Erstellungszeitpunkt des Benutzers.
     */
    private LocalDateTime createdAt;

    /**
     * Letzte Aktualisierung des Benutzers.
     */
    private LocalDateTime updatedAt;

    /**
     * Setzt Erstellungs- und Aktualisierungszeitpunkt beim erstmaligen Speichern.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    /**
     * Aktualisiert den Aktualisierungszeitpunkt beim Speichern, wenn der Benutzer aktiv ist.
     */
    @PreUpdate
    protected void onUpdate() {
        if (userStatus == UserStatus.ACTIVE) {
            updatedAt = LocalDateTime.now();
        }
    }

    /**
     * Gibt die Rollen des Benutzers zurück, die für die Autorisierung verwendet werden.
     */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role.getRole()));
    }

    /**
     * Gibt den Benutzernamen zurück (in diesem Fall die E-Mail-Adresse).
     */
    @Override
    public String getUsername() {
        return email;
    }

    /**
     * Gibt an, ob das Konto abgelaufen ist (immer true).
     */
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    /**
     * Gibt an, ob das Konto gesperrt ist (immer true).
     */
    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    /**
     * Gibt an, ob die Zugangsdaten abgelaufen sind (immer true).
     */
    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    /**
     * Gibt an, ob der Benutzer aktiviert ist.
     */
    @Override
    public boolean isEnabled() {
        return userStatus == UserStatus.ACTIVE;
    }

    /**
     * Gibt den Namen des Benutzers als String-Repräsentation zurück.
     */
    @Override
    public String toString() {
        return name;
    }

}