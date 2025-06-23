package rh.ptp.quizapp.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;
import rh.ptp.quizapp.dto.UserDTO;
import rh.ptp.quizapp.model.QuizCategory;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.AuthenticationTokenRepository;
import rh.ptp.quizapp.repository.QuizResultRepository;
import rh.ptp.quizapp.repository.UserRepository;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private QuizResultRepository quizResultRepository;

    @Mock
    private AuthenticationTokenRepository authenticationTokenRepository;

    @Mock
    private AuthService authService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private UserDetails userDetails;

    @InjectMocks
    private UserService userService;

    private User testUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(userService, "frontendUrl", "https://frontend.example.com");

        testUser = new User();
        testUser.setId(1L);
        testUser.setName("Test User");
        testUser.setEmail("test@example.com");
        testUser.setPassword("encodedPassword");
        testUser.setUserStatus(UserStatus.ACTIVE);
        testUser.setDailyQuizReminder(true);
        testUser.setDailyStreak(5);
        testUser.setCreatedAt(LocalDateTime.now().minusDays(10));
        testUser.setUpdatedAt(LocalDateTime.now().minusDays(5));
    }

    @Test
    void forgotPassword_WithExistingUser_CreatesTokenAndSendsEmail() {
        String email = "test@example.com";
        String token = "test-token";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(authenticationTokenRepository.findTokenByQuizUser(testUser)).thenReturn(token);

        userService.forgotPassword(email);

        verify(authService, times(1)).createAuthenticationToken(testUser);
        verify(authenticationTokenRepository, times(1)).findTokenByQuizUser(testUser);
        verify(emailService, times(1)).sendEmail(eq(email), eq("Passwort zurücksetzen"), eq("password-reset-email"), any(Map.class));
    }

    @Test
    void forgotPassword_WithNonExistingUser_ThrowsRuntimeException() {
        String email = "nonexistent@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> userService.forgotPassword(email));
        assertEquals("Benutzer nicht gefunden", exception.getMessage());
        verify(authService, never()).createAuthenticationToken(any(User.class));
        verify(emailService, never()).sendEmail(anyString(), anyString(), anyString(), any(Map.class));
    }

    @Test
    void resetPassword_WithValidToken_UpdatesPasswordAndStatus() {
        String token = "valid-token";
        String newPassword = "newPassword";
        String encodedPassword = "encodedNewPassword";

        when(authenticationTokenRepository.findQuizUserByToken(token)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedPassword);

        userService.resetPassword(token, newPassword);

        assertEquals(encodedPassword, testUser.getPassword());
        assertEquals(UserStatus.ACTIVE, testUser.getUserStatus());
        verify(authenticationTokenRepository, times(1)).deleteAllById(testUser.getId());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void resetPassword_WithInvalidToken_ThrowsRuntimeException() {
        String token = "invalid-token";
        String newPassword = "newPassword";

        when(authenticationTokenRepository.findQuizUserByToken(token)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> userService.resetPassword(token, newPassword));
        assertEquals("Ungültiger oder abgelaufener Token", exception.getMessage());
        verify(authenticationTokenRepository, never()).deleteAllById(anyLong());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateDailyQuizReminder_WithExistingUser_UpdatesReminder() {
        Long userId = 1L;
        boolean reminder = false;

        when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

        userService.updateDailyQuizReminder(userId, reminder);

        assertEquals(reminder, testUser.isDailyQuizReminder());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void updateDailyQuizReminder_WithNonExistingUser_ThrowsRuntimeException() {
        Long userId = 999L;
        boolean reminder = false;

        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> userService.updateDailyQuizReminder(userId, reminder));
        assertEquals("Benutzer nicht gefunden", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void getUserByEmail_WithExistingUser_ReturnsUser() {
        String email = "test@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));

        User result = userService.getUserByEmail(email);

        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getEmail(), result.getEmail());
    }

    @Test
    void getUserByEmail_WithNonExistingUser_ThrowsRuntimeException() {
        String email = "nonexistent@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> userService.getUserByEmail(email));
        assertEquals("Benutzer nicht gefunden", exception.getMessage());
    }

    @Test
    void updateProfile_WithExistingUser_UpdatesProfile() {
        String email = "test@example.com";
        UserDTO userDTO = new UserDTO();
        userDTO.setName("Updated Name");
        userDTO.setEmail("updated@example.com");
        userDTO.setDailyQuizReminder(false);

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        User result = userService.updateProfile(email, userDTO);

        assertEquals(userDTO.getName(), result.getName());
        assertEquals(userDTO.getEmail(), result.getEmail());
        assertEquals(userDTO.isDailyQuizReminder(), result.isDailyQuizReminder());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void updateProfile_WithNonExistingUser_ThrowsRuntimeException() {
        String email = "nonexistent@example.com";
        UserDTO userDTO = new UserDTO();

        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        Exception exception = assertThrows(RuntimeException.class, () -> userService.updateProfile(email, userDTO));
        assertEquals("Benutzer nicht gefunden", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updatePassword_WithCorrectCurrentPassword_UpdatesPassword() {
        String email = "test@example.com";
        String currentPassword = "currentPassword";
        String newPassword = "newPassword";
        String encodedNewPassword = "encodedNewPassword";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(currentPassword, testUser.getPassword())).thenReturn(true);
        when(passwordEncoder.encode(newPassword)).thenReturn(encodedNewPassword);

        userService.updatePassword(email, currentPassword, newPassword);

        assertEquals(encodedNewPassword, testUser.getPassword());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void updatePassword_WithIncorrectCurrentPassword_ThrowsRuntimeException() {
        String email = "test@example.com";
        String currentPassword = "wrongPassword";
        String newPassword = "newPassword";

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(currentPassword, testUser.getPassword())).thenReturn(false);

        Exception exception = assertThrows(RuntimeException.class,
            () -> userService.updatePassword(email, currentPassword, newPassword));
        assertEquals("Aktuelles Passwort ist falsch", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void incrementDailyQuizStreak_WhenNotPlayedToday_IncrementsStreak() {
        String email = "test@example.com";
        LocalDate today = LocalDate.now();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(quizResultRepository.existsByUserIdAndQuizCategoriesAndPlayedAtAfter(
            eq(testUser.getId()), eq(QuizCategory.DAILY_QUIZ), any(LocalDateTime.class))).thenReturn(false);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        int result = userService.incrementDailyQuizStreak(email);

        assertEquals(6, result);
        assertEquals(6, testUser.getDailyStreak());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void incrementDailyQuizStreak_WhenAlreadyPlayedToday_DoesNotIncrementStreak() {
        String email = "test@example.com";
        LocalDate today = LocalDate.now();

        when(userRepository.findByEmail(email)).thenReturn(Optional.of(testUser));
        when(quizResultRepository.existsByUserIdAndQuizCategoriesAndPlayedAtAfter(
            eq(testUser.getId()), eq(QuizCategory.DAILY_QUIZ), any(LocalDateTime.class))).thenReturn(true);
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        int result = userService.incrementDailyQuizStreak(email);

        assertEquals(5, result);
        assertEquals(5, testUser.getDailyStreak());
        verify(userRepository, times(1)).save(testUser);
    }

    @Test
    void getUserFromUserDetails_WithValidUserDetails_ReturnsUser() {
        String username = "test@example.com";

        when(userDetails.getUsername()).thenReturn(username);
        when(userRepository.findByEmail(username)).thenReturn(Optional.of(testUser));

        User result = userService.getUserFromUserDetails(userDetails);

        assertNotNull(result);
        assertEquals(testUser.getId(), result.getId());
        assertEquals(testUser.getEmail(), result.getEmail());
    }

    @Test
    void getUserFromUserDetails_WithNullUserDetails_ThrowsIllegalArgumentException() {
        Exception exception = assertThrows(IllegalArgumentException.class,
            () -> userService.getUserFromUserDetails(null));
        assertEquals("UserDetails cannot be null", exception.getMessage());
    }

    @Test
    void getUserFromUserDetails_WithNonExistingUser_ThrowsUsernameNotFoundException() {
        String username = "nonexistent@example.com";

        when(userDetails.getUsername()).thenReturn(username);
        when(userRepository.findByEmail(username)).thenReturn(Optional.empty());

        Exception exception = assertThrows(UsernameNotFoundException.class,
            () -> userService.getUserFromUserDetails(userDetails));
        assertEquals("User not found with username: " + username, exception.getMessage());
    }
}
