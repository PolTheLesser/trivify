package rh.ptp.quizapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
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

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final AuthenticationTokenRepository authenticationTokenRepository;
    @Autowired
    private EmailService emailService;
    @Value("${frontend.url}")
    private String frontendUrl;

    public User register(RegisterRequest request) {
        if (userRepository.existsByName(request.getName())) {
            throw new RuntimeException("Benutzername ist bereits vergeben");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("E-Mail-Adresse wird bereits verwendet");
        }

        User pendingUser = new User()
                .setName(request.getName())
                .setEmail(request.getEmail())
                .setPassword(passwordEncoder.encode(request.getPassword()))
                .setUserStatus(UserStatus.PENDING_VERIFICATION)
                .setDailyQuizReminder(request.isDailyQuizReminder());

        pendingUser = userRepository.save(pendingUser);
        AuthenticationToken token = createAuthenticationToken(pendingUser);

        sendVerificationEmail(request.getEmail(), request.getName(), token.getToken());

        return pendingUser;
    }

    AuthenticationToken createAuthenticationToken(User user) {
        AuthenticationToken existingToken = authenticationTokenRepository.findByQuizUser(user);
        if (existingToken != null) {
            authenticationTokenRepository.delete(existingToken);
        }
        AuthenticationToken newToken = new AuthenticationToken(user);
        if(user.getUserStatus() == UserStatus.PENDING_VERIFICATION) {
            Map<String, Object> variables = new HashMap<>();
            variables.put("logoUrl", frontendUrl+"/logo192.png");
            variables.put("username", user.getName());
            variables.put("verificationUrl", frontendUrl + "/verify-email/" + newToken);
            variables.put("dataUrl", frontendUrl + "/datenschutz");
            emailService.sendEmail(user.getEmail(), "E-Mail-Adresse verifizieren", "verification-email", variables);
        }
        return authenticationTokenRepository.save(newToken);
    }

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
                variables.put("logoUrl", frontendUrl + "/logo192.png");
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

    private void sendVerificationEmail(String email, String name, String token) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("logoUrl", frontendUrl+"/logo192.png");
        variables.put("username", name);
        variables.put("verificationUrl", frontendUrl + "/verify-email/" + token);
        variables.put("dataUrl", frontendUrl + "/datenschutz");
        emailService.sendEmail(email, "E-Mail-Adresse verifizieren", "verification-email", variables);
    }

    public User getCurrentUser(String token) {
        String email = jwtService.extractUsername(token.substring(7));
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
    }
} 