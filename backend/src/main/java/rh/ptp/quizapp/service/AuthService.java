package rh.ptp.quizapp.service;

import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import rh.ptp.quizapp.dto.AuthResponse;
import rh.ptp.quizapp.dto.LoginRequest;
import rh.ptp.quizapp.dto.RegisterRequest;
import rh.ptp.quizapp.dto.UserDTO;
import rh.ptp.quizapp.model.AuthenticationToken;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.AuthenticationTokenRepository;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.security.JwtService;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Service für Authentifizierung und Registrierung von Benutzern.
 * Beinhaltet Registrierung, Login, E-Mail-Verifikation sowie Tokenmanagement.
 */
@Service
@RequiredArgsConstructor
public class AuthService {
    private final Logger logger = LoggerFactory.getLogger(AuthService.class);
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuthenticationTokenRepository authenticationTokenRepository;
    private final EmailService emailService;

    @Value("${frontend.url}")
    private String frontendUrl;

    /**
     * Registriert einen neuen Benutzer.
     * Wenn Benutzername bereits existiert, wird eine Exception geworfen.
     * Falls E-Mail bereits existiert, wird ein Passwort-Zurücksetzen-Token generiert und E-Mail verschickt.
     * Sendet Verifizierungs-E-Mail an neu registrierten Benutzer.
     *
     * @param request RegisterRequest mit Benutzerdaten
     * @return Angelegter Benutzer mit verschlüsseltem Passwort und PENDING_VERIFICATION Status
     * @throws RuntimeException bei existierendem Benutzernamen
     */
    public String register(RegisterRequest request) {
        if (userRepository.existsByName(request.getName())) {
            throw new RuntimeException("Benutzername ist bereits vergeben");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
            createAuthenticationToken(user);
            String token = authenticationTokenRepository.findTokenByQuizUser(user);
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl+"/icons/logo512.png");
            variables.put("username", user.getName());
            variables.put("resetUrl", frontendUrl + "/reset-password/" + token);
            emailService.sendEmail(user.getEmail(), "Passwort zurücksetzen", "password-reset-email", variables);
            return "Ein Account mit dieser Email existiert bereits, überprüfen Sie Ihre E-Mail-Adresse, um das Passwort zurückzusetzen.";
        }

        User pendingUser = new User()
                .setName(request.getName())
                .setEmail(request.getEmail())
                .setPassword(passwordEncoder.encode(request.getPassword()))
                .setUserStatus(UserStatus.PENDING_VERIFICATION)
                .setDailyQuizReminder(request.isDailyQuizReminder());

        pendingUser = userRepository.save(pendingUser);
        createAuthenticationToken(pendingUser);
        return "Bitte überprüfen Sie Ihre E-Mail-Adresse, um Ihre Registrierung abzuschließen.";
    }

    /**
     * Erstellt einen neuen Verifikations- oder Passwort-Zurücksetzen-Token für einen Benutzer.
     * Löscht ggf. vorhandene Token vorher.
     * Sendet Verifizierungs-E-Mail wenn der Nutzer den Status PENDING_VERIFICATION hat.
     *
     * @param user Benutzer, für den der Token erstellt wird
     * @return Erstellter AuthenticationToken
     */
    AuthenticationToken createAuthenticationToken(User user) {
        AuthenticationToken existingToken = authenticationTokenRepository.findByQuizUser(user);
        logger.info("Existing token: " + existingToken);
        if (existingToken != null) {
            authenticationTokenRepository.deleteById(existingToken.getId());
            authenticationTokenRepository.flush();
        }
        AuthenticationToken newToken = new AuthenticationToken(user);
        if(user.getUserStatus() == UserStatus.PENDING_VERIFICATION) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl+"/icons/logo512.png");
            variables.put("username", user.getName());
            variables.put("verificationUrl", frontendUrl + "/verify-email/" + newToken.getToken());
            emailService.sendEmail(user.getEmail(), "E-Mail-Adresse verifizieren", "verification-email", variables);
        }
        return authenticationTokenRepository.save(newToken);
    }

    /**
     * Authentifiziert einen Benutzer anhand der Login-Daten.
     * Prüft Benutzerstatus und wirft Ausnahmen bei gesperrtem oder nicht verifiziertem Benutzer.
     * Generiert und gibt ein JWT Token zurück.
     *
     * @param request LoginRequest mit E-Mail und Passwort
     * @return AuthResponse mit JWT Token und UserDTO
     * @throws RuntimeException bei fehlerhafter Anmeldung oder Statusproblemen
     */
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

            if (user.getUserStatus()==UserStatus.PENDING_VERIFICATION) {
                throw new RuntimeException("E-Mail-Adresse nicht verifiziert");
            } else if (user.getUserStatus()==UserStatus.BLOCKED) {
                throw new RuntimeException("Benutzerkonto ist gesperrt");
            } else if (user.getUserStatus()==UserStatus.PENDING_DELETE) {
                user.setUserStatus(UserStatus.ACTIVE);
                userRepository.save(user);
                Map<String, Object> variables = new HashMap<>();
                variables.put("logoUrl", frontendUrl + "/icons/logo512.png");
                variables.put("username", user.getName());
                variables.put("quizUrl", frontendUrl + "/daily-quiz");
                emailService.sendEmail(user.getEmail(), "Account reaktiviert", "account-reactivated", variables);
            }

            String token = jwtService.generateToken(user);
            return AuthResponse.builder()
                    .token(token)
                    .user(UserDTO.fromUser(user))
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Anmeldung fehlgeschlagen: " + e.getMessage());
        }
    }

    /**
     * Verifiziert die E-Mail-Adresse eines Benutzers anhand eines Verifikations-Tokens.
     * Setzt den Benutzerstatus auf ACTIVE und löscht den Token nach erfolgreicher Verifikation.
     *
     * @param token Verifikations-Token aus dem E-Mail-Link
     * @return Verifizierter Benutzer mit Status ACTIVE
     * @throws RuntimeException bei ungültigem oder abgelaufenem Token
     */
    public User verifyEmail(String token) {
        AuthenticationToken authenticationToken = authenticationTokenRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Ungültiger oder abgelaufener Verifizierungslink"));

        if (authenticationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verifizierungslink ist abgelaufen");
        }

        User user = authenticationToken.getQuizUser();
        user.setUserStatus(UserStatus.ACTIVE);

        userRepository.save(user);
        authenticationTokenRepository.delete(authenticationToken);
        return user;
    }

    /**
     * Liefert den aktuell angemeldeten Benutzer anhand eines JWT Tokens.
     *
     * @param token JWT Token aus dem Authorization Header (mit "Bearer " Präfix)
     * @return Benutzerobjekt des eingeloggten Benutzers
     * @throws RuntimeException wenn Benutzer nicht gefunden wird
     */
    public User getCurrentUser(String token) {
        String email = jwtService.extractUsername(token.substring(7));
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
    }
}