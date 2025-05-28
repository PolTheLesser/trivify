package rh.ptp.quizapp.dto;

import lombok.Data;

/**
 * Datenübertragungsobjekt für Anfragen zum Zurücksetzen des Passworts.
 * Enthält die E-Mail-Adresse des Benutzers.
 */
@Data
public class ForgotPasswordRequest {

    /**
     * E-Mail-Adresse für den Passwort-Zurücksetzungsprozess.
     */
    private String email;
}
