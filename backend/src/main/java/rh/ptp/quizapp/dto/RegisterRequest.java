package rh.ptp.quizapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jdk.jfr.BooleanFlag;
import lombok.Data;

/**
 * Datenübertragungsobjekt für eine Benutzerregistrierungsanfrage.
 * Enthält die notwendigen Daten zur Neuanmeldung eines Benutzers.
 */
@Data
public class RegisterRequest {

    /**
     * Name des Benutzers.
     * Muss angegeben werden und muss zwischen 2 und 50 Zeichen lang sein.
     */
    @NotBlank(message = "Name ist erforderlich")
    @Size(min = 2, max = 50, message = "Name muss zwischen 2 und 50 Zeichen lang sein")
    private String name;

    /**
     * E-Mail-Adresse des Benutzers.
     * Muss angegeben werden und eine gültige E-Mail sein.
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
     * Gibt an, ob der Benutzer Erinnerungen für das tägliche Quiz erhalten möchte.
     */
    private boolean dailyQuizReminder;
}
