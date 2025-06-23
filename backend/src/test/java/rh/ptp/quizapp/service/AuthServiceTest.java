package rh.ptp.quizapp.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import rh.ptp.quizapp.dto.AuthResponse;
import rh.ptp.quizapp.dto.LoginRequest;
import rh.ptp.quizapp.dto.RegisterRequest;
import rh.ptp.quizapp.model.AuthenticationToken;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.AuthenticationTokenRepository;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.security.JwtService;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private AuthenticationTokenRepository authenticationTokenRepository;
    @Mock private EmailService emailService;

    @InjectMocks private AuthService authService;

    private final String testEmail = "test@example.com";
    private final String testName = "testUser";
    private final String testPassword = "password123";
    private final String encodedPassword = "encodedPassword";
    private final String frontendUrl = "http://frontend";
    private final String testToken = "jwtToken123";

    @Test
    void register_NewUser_CreatesPendingUser() {
        RegisterRequest request = new RegisterRequest();
        request.setPassword(testPassword);
        request.setEmail(testEmail);
        request.setName(testName);
        request.setDailyQuizReminder(false);
        when(userRepository.existsByName(testName)).thenReturn(false);
        when(userRepository.existsByEmail(testEmail)).thenReturn(false);
        when(passwordEncoder.encode(testPassword)).thenReturn(encodedPassword);
        when(userRepository.save(any(User.class))).thenAnswer(inv -> {
            User user = inv.getArgument(0);
            user.setId(1L);
            return user;
        });
        when(authenticationTokenRepository.findByQuizUser(any())).thenReturn(null);
        when(authenticationTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String result = authService.register(request);

        assertEquals("Bitte überprüfen Sie Ihre E-Mail-Adresse, um Ihre Registrierung abzuschließen.", result);
        verify(emailService).sendEmail(eq(testEmail), anyString(), anyString(), anyMap());
    }

    @Test
    void register_ExistingUsername_ThrowsException() {
        RegisterRequest request = new RegisterRequest();
        request.setPassword(encodedPassword);
        request.setEmail(testEmail);
        request.setName(testName);
        request.setDailyQuizReminder(false);
        when(userRepository.existsByName(testName)).thenReturn(true);

        assertThrows(RuntimeException.class, () -> authService.register(request));
    }

    @Test
    void register_ExistingEmail_SendsPasswordReset() {
        RegisterRequest request = new RegisterRequest();
        request.setPassword(testPassword);
        request.setEmail(testEmail);
        request.setName(testName);
        request.setDailyQuizReminder(false);

        User existingUser = new User();
        existingUser.setEmail(testEmail);
        existingUser.setName("existingUser");
        existingUser.setDailyQuizReminder(false);
        existingUser.setPassword(encodedPassword);
        existingUser.setId(1L);
        existingUser.setUserStatus(UserStatus.ACTIVE);

        when(userRepository.existsByName(testName)).thenReturn(false);
        when(userRepository.existsByEmail(testEmail)).thenReturn(true);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(existingUser));
        when(authenticationTokenRepository.findByQuizUser(existingUser)).thenReturn(null);
        when(authenticationTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        String result = authService.register(request);

        assertEquals("Ein Account mit dieser E-Mail existiert bereits. Bitte überprüfen Sie Ihre E-Mail-Adresse, um das Passwort zurückzusetzen.", result);
        verify(emailService).sendEmail(eq(testEmail), anyString(), eq("password-reset-email"), anyMap());
    }

    @Test
    void createAuthenticationToken_NewToken_SendsVerificationEmail() {
        User user = new User().setUserStatus(UserStatus.PENDING_VERIFICATION);
        when(authenticationTokenRepository.findByQuizUser(user)).thenReturn(null);
        when(authenticationTokenRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        AuthenticationToken token = authService.createAuthenticationToken(user);

        assertNotNull(token.getToken());
        verify(emailService).sendEmail(any(), eq("E-Mail-Adresse verifizieren"), any(), anyMap());
    }

    @Test
    void createAuthenticationToken_ExistingToken_DeletesOldToken() {
        User user = new User();
        AuthenticationToken oldToken = new AuthenticationToken();
        when(authenticationTokenRepository.findByQuizUser(user)).thenReturn(oldToken);

        authService.createAuthenticationToken(user);

        verify(authenticationTokenRepository).deleteById(oldToken.getId());
        verify(authenticationTokenRepository).flush();
    }

    @Test
    void login_ValidCredentials_ReturnsToken() {
        LoginRequest request = new LoginRequest();
        request.setEmail(testEmail);
        request.setPassword(testPassword);
        User user = new User().setUserStatus(UserStatus.ACTIVE);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(user));
        when(jwtService.generateToken(user)).thenReturn(testToken);

        AuthResponse response = authService.login(request);

        assertEquals(testToken, response.getToken());
        verify(authenticationManager).authenticate(any());
    }

    @Test
    void login_PendingVerification_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail(testEmail);
        request.setPassword(testPassword);
        User user = new User().setUserStatus(UserStatus.PENDING_VERIFICATION);
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(user));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("nicht verifiziert"));
    }

    @Test
    void login_InvalidCredentials_ThrowsException() {
        LoginRequest request = new LoginRequest();
        request.setEmail(testEmail);
        request.setPassword(testPassword);
        when(authenticationManager.authenticate(any()))
                .thenThrow(new BadCredentialsException("Invalid credentials"));

        RuntimeException ex = assertThrows(RuntimeException.class, () -> authService.login(request));
        assertTrue(ex.getMessage().contains("fehlgeschlagen"));
    }

    @Test
    void verifyEmail_ValidToken_ActivatesUser() {
        String token = "validToken";
        AuthenticationToken authToken = new AuthenticationToken();
        User user = new User().setUserStatus(UserStatus.PENDING_VERIFICATION);
        authToken.setQuizUser(user);
        authToken.setExpiryDate(LocalDateTime.now().plusHours(1));

        when(authenticationTokenRepository.findByToken(token)).thenReturn(Optional.of(authToken));

        User result = authService.verifyEmail(token);

        assertEquals(UserStatus.ACTIVE, result.getUserStatus());
        verify(authenticationTokenRepository).delete(authToken);
    }

    @Test
    void verifyEmail_ExpiredToken_ThrowsException() {
        String token = "expiredToken";
        AuthenticationToken authToken = new AuthenticationToken();
        authToken.setExpiryDate(LocalDateTime.now().minusHours(1));

        when(authenticationTokenRepository.findByToken(token)).thenReturn(Optional.of(authToken));

        assertThrows(RuntimeException.class, () -> authService.verifyEmail(token));
    }

    @Test
    void getCurrentUser_ValidToken_ReturnsUser() {
        String bearerToken = "Bearer " + testToken;
        when(jwtService.extractUsername(testToken)).thenReturn(testEmail);
        User expectedUser = new User();
        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(expectedUser));

        User result = authService.getCurrentUser(bearerToken);

        assertEquals(expectedUser, result);
    }

    @Test
    void getCurrentUser_InvalidUser_ThrowsException() {
        String bearerToken = "Bearer invalidToken";
        when(jwtService.extractUsername("invalidToken")).thenReturn("unknown@email.com");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> authService.getCurrentUser(bearerToken));
    }
}