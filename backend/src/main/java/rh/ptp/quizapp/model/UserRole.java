package rh.ptp.quizapp.model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Enum zur Definition der Benutzerrollen im System.
 */
@Getter
public enum UserRole {

    /**
     * Standard-Benutzerrolle.
     */
    ROLE_USER("ROLE_USER"),

    /**
     * Administratorrolle mit erweiterten Rechten.
     */
    ROLE_ADMIN("ROLE_ADMIN");

    private final String role;

    UserRole(String role) {
        this.role = role;
    }

    /**
     * Gibt eine Liste aller verfügbaren Rollen als Strings zurück.
     *
     * @return Liste von Rollen
     */
    public static List<String> getUserRoles() {
        List<String> roles = new ArrayList<>();
        Arrays.stream(UserRole.values()).forEach(userRole -> roles.add(userRole.getRole()));
        return roles;
    }
}