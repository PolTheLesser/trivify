package rh.ptp.quizapp.dto;

import lombok.Data;

/**
 * Datenübertragungsobjekt zur Aktualisierung von Benutzerinformationen.
 * Kann verwendet werden, um den Namen oder die Einstellungen für Erinnerungen zu ändern.
 */
@Data
public class UpdateUserRequest {

    /**
     * Neuer Name des Benutzers (optional).
     */
    private String name;

    /**
     * Einstellung für Erinnerungen zum täglichen Quiz (optional).
     */
    private String dailyQuizReminder;
}
