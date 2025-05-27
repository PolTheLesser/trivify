package rh.ptp.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

/**
 * Datenübertragungsobjekt zur Übermittlung einfacher Textnachrichten.
 * Wird z. B. für Erfolgsmeldungen oder Fehler verwendet.
 */
@Data
@AllArgsConstructor
public class MessageResponse {

    /**
     * Die eigentliche Nachricht.
     */
    private String message;
}
