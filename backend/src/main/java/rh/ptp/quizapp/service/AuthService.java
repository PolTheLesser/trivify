package rh.ptp.quizapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import rh.ptp.quizapp.dto.AuthResponse;
import rh.ptp.quizapp.dto.LoginRequest;
import rh.ptp.quizapp.dto.RegisterRequest;
import rh.ptp.quizapp.dto.UserDTO;
import rh.ptp.quizapp.model.RegistrationRequest;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.repository.RegistrationRequestRepository;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.security.JwtService;
import org.springframework.beans.factory.annotation.Autowired;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RegistrationRequestRepository registrationRequestRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    @Autowired
    private EmailService emailService;
    @Value("${frontend.url}")
    private String frontendUrl;

    public RegistrationRequest register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail()) || 
            registrationRequestRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("E-Mail-Adresse wird bereits verwendet");
        }

        RegistrationRequest registrationRequest = new RegistrationRequest();
        registrationRequest.setName(request.getName());
        registrationRequest.setEmail(request.getEmail());
        registrationRequest.setPassword(passwordEncoder.encode(request.getPassword()));
        registrationRequest.setDailyQuizReminder(request.isDailyQuizReminder());
        registrationRequest.setVerificationToken(UUID.randomUUID().toString());
        registrationRequest.setExpiryDate(LocalDateTime.now().plusHours(24));

        registrationRequest = registrationRequestRepository.save(registrationRequest);

        sendVerificationEmail(request.getEmail(), request.getName(), registrationRequest.getVerificationToken());

        return registrationRequest;
    }

    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
            );

            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

            if (!user.isEmailVerified()) {
                throw new RuntimeException("E-Mail-Adresse nicht verifiziert");
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
        RegistrationRequest request = registrationRequestRepository.findByVerificationToken(token)
            .orElseThrow(() -> new RuntimeException("Ungültiger oder abgelaufener Verifizierungslink"));

        if (request.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Verifizierungslink ist abgelaufen");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setEmailVerified(true);
        user.setDailyQuizReminder(request.isDailyQuizReminder());
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        user = userRepository.save(user);
        registrationRequestRepository.delete(request);

        return user;
    }

    private void sendVerificationEmail(String email, String name, String token) {
        Map<String, Object> variables = new HashMap<>();
        variables.put("username", name);
        variables.put("verificationUrl", frontendUrl + "/verify-email/" + token);
        emailService.sendEmail(email, "E-Mail-Adresse verifizieren", "verification-email", variables);
    }

    public User getCurrentUser(String token) {
        String email = jwtService.extractUsername(token.substring(7));
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));
    }
} 