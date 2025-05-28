package rh.ptp.quizapp.model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Enum zur Definition des Status eines Benutzers.
 */
@Getter
public enum UserStatus {

    /**
     * Aktiver Benutzer mit vollem Zugriff.
     */
    ACTIVE("ACTIVE"),

    /**
     * Benutzer wartet auf Verifizierung (z.B. E-Mail-Bestätigung).
     */
    PENDING_VERIFICATION("PENDING_VERIFICATION"),

    /**
     * Benutzerkonto wurde zur Löschung vorgemerkt.
     */
    PENDING_DELETE("PENDING_DELETE"),

    /**
     * Benutzerkonto wurde gesperrt.
     */
    BLOCKED("BLOCKED");

    private final String status;

    UserStatus(String status) {
        this.status = status;
    }

    /**
     * Gibt eine Liste aller möglichen Statuswerte als Strings zurück.
     *
     * @return Liste von Benutzerstatuswerten
     */
    public static List<String> getUserStates() {
        List<String> states = new ArrayList<>();
        Arrays.stream(UserStatus.values()).forEach(userStatus -> states.add(userStatus.getStatus()));
        return states;
    }
}