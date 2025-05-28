package rh.ptp.quizapp.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * Datenübertragungsobjekt für Login-Anfragen.
 * Enthält E-Mail und Passwort des Benutzers.
 */
@Data
public class LoginRequest {

    /**
     * E-Mail-Adresse des Benutzers.
     * Muss gültig und nicht leer sein.
     */
    @NotBlank(message = "E-Mail ist erforderlich")
    @Email(message = "Ungültige E-Mail-Adresse")
    @JsonProperty("email")
    private String email;

    /**
     * Passwort des Benutzers.
     * Darf nicht leer sein.
     */
    @JsonProperty("password")
    @NotBlank(message = "Passwort ist erforderlich")
    private String password;
}
