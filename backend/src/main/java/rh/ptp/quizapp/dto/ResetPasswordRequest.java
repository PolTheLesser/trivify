package rh.ptp.quizapp.dto;

import lombok.Data;

/**
 * Datenübertragungsobjekt für eine Passwort-Zurücksetzungsanfrage.
 * Enthält das neue Passwort, das gesetzt werden soll.
 */
@Data
public class ResetPasswordRequest {

    /**
     * Neues Passwort des Benutzers.
     */
    private String newPassword;
}
