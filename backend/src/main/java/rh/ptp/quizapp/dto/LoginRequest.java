package rh.ptp.quizapp.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "E-Mail oder Benutzername ist erforderlich")
    private String identifier; // kann E-Mail oder Benutzername sein

    @NotBlank(message = "Passwort ist erforderlich")
    private String password;
}