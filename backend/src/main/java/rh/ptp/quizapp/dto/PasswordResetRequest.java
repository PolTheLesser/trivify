package rh.ptp.quizapp.dto;

import lombok.Data;

/**
 * Datenübertragungsobjekt für eine Passwort-Zurücksetzungsanfrage.
 * Enthält die E-Mail-Adresse des Benutzers.
 */
@Data
public class PasswordResetRequest {

    /**
     * E-Mail-Adresse zur Identifikation des Benutzers.
     */
    private String email;
}
