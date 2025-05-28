package rh.ptp.quizapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserRole;
import rh.ptp.quizapp.model.UserStatus;

import java.time.LocalDateTime;

/**
 * Datenübertragungsobjekt für Benutzerdaten.
 * Dieses DTO wird verwendet, um Benutzerinformationen zwischen Client und Server zu übertragen.
 * Es enthält persönliche Daten, Statusinformationen, Rollen und weitere Metadaten.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {

    /**
     * Name des Benutzers.
     * Muss angegeben werden und muss zwischen 2 und 50 Zeichen lang sein.
     */
    @NotBlank(message = "Name ist erforderlich")
    @Size(min = 2, max = 50, message = "Name muss zwischen 2 und 50 Zeichen lang sein")
    private String name;

    /**
     * E-Mail-Adresse des Benutzers.
     * Muss angegeben werden und muss eine gültige E-Mail-Adresse sein.
     */
    @NotBlank(message = "E-Mail ist erforderlich")
    @Email(message = "Ungültige E-Mail-Adresse")
    private String email;

    /**
     * Passwort des Benutzers.
     * Muss angegeben werden und mindestens 6 Zeichen lang sein.
     */
    @NotBlank(message = "Passwort ist erforderlich")
    @Size(min = 6, message = "Passwort muss mindestens 6 Zeichen lang sein")
    private String password;

    /**
     * Status des Benutzers (z.B. aktiv, gesperrt).
     */
    private UserStatus userStatus;

    /**
     * Eindeutige ID des Benutzers.
     */
    private Long id;

    /**
     * Rolle des Benutzers (z.B. ADMIN, USER).
     */
    private UserRole role;

    /**
     * Gibt an, ob der Benutzer Erinnerungen für das tägliche Quiz erhalten möchte.
     */
    private boolean dailyQuizReminder;

    /**
     * Anzahl der aufeinanderfolgenden Tage, an denen der Benutzer das tägliche Quiz gespielt hat.
     */
    private int dailyStreak;

    /**
     * Zeitpunkt, wann der Benutzer das letzte Mal das tägliche Quiz gespielt hat.
     */
    private LocalDateTime lastDailyQuizPlayed;

    /**
     * Zeitpunkt, an dem der Benutzeraccount erstellt wurde.
     */
    private LocalDateTime createdAt;

    /**
     * Zeitpunkt der letzten Aktualisierung der Benutzerdaten.
     */
    private LocalDateTime updatedAt;

    /**
     * Hilfsmethode zum Erzeugen eines UserDTOs aus einem User-Entity-Objekt.
     *
     * @param user User-Entity, aus dem die Daten kopiert werden
     * @return UserDTO mit den Daten des Users
     */
    public static UserDTO fromUser(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setDailyQuizReminder(user.isDailyQuizReminder());
        dto.setDailyStreak(user.getDailyStreak());
        dto.setUserStatus(user.getUserStatus());
        dto.setRole(user.getRole());
        dto.setCreatedAt(user.getCreatedAt());
        dto.setUpdatedAt(user.getUpdatedAt());
        dto.setLastDailyQuizPlayed(user.getLastDailyQuizPlayed());
        return dto;
    }
}
