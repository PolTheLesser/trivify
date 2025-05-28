package rh.ptp.quizapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Datenübertragungsobjekt für die Antwort nach erfolgreicher Authentifizierung.
 * Enthält ein JWT-Token und Informationen über den Benutzer.
 */
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {

    /**
     * JWT-Token für die Sitzung.
     */
    private String token;

    /**
     * Benutzerinformationen.
     */
    private UserDTO user;
}
