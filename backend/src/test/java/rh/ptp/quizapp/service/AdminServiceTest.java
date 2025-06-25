package rh.ptp.quizapp.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserRole;
import rh.ptp.quizapp.repository.UserRepository;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserRepository userRepository;
    @Mock
    private EmailService emailService;

    @InjectMocks
    private AdminService adminService;

    @Test
    void createUser_EncodesPasswordAndSendsEmail() {
        User newUser = new User();
        newUser.setPassword("plainPassword");
        when(passwordEncoder.encode("plainPassword")).thenReturn("hashedPassword");

        adminService.createUser(newUser);

        verify(passwordEncoder).encode("plainPassword");
        verify(userRepository).save(newUser);
        verify(emailService).sendEmail(
                any(),
                eq("Dein Benutzerkonto wurde durch einen Admin erstellt!"),
                eq("account-created"),
                any()
        );
    }

    @Test
    void createUser_ReturnsUserWithOriginalPassword() {
        User newUser = new User();
        newUser.setPassword("plainPassword");
        when(passwordEncoder.encode(any())).thenReturn("hashedPassword");

        User result = adminService.createUser(newUser);

        assertThat(result.getPassword()).isEqualTo("plainPassword");
    }

    @Test
    void createUser_SetsTimestamps() {
        User newUser = new User();
        newUser.setPassword("password");

        adminService.createUser(newUser);

        assertThat(newUser.getCreatedAt()).isNotNull();
        assertThat(newUser.getUpdatedAt()).isNotNull();
    }


    @Test
    void updateUser_SendsPromotionEmailWhenRoleChangedToAdmin() {
        User existingUser = new User();
        existingUser.setPassword("oldHash");
        existingUser.setEmail("email");
        existingUser.setName("name");
        existingUser.setId(2L);
        existingUser.setRole(UserRole.ROLE_USER);

        User updatedUser = new User();
        updatedUser.setPassword("oldHash");
        updatedUser.setEmail("email");
        updatedUser.setName("name");
        updatedUser.setId(2L);
        updatedUser.setRole(UserRole.ROLE_ADMIN);

        when(userRepository.findById(any())).thenReturn(java.util.Optional.of(existingUser));
        when(passwordEncoder.matches(any(), any())).thenReturn(false);

        adminService.updateUser(2L, updatedUser);

        verify(emailService).sendEmail(
                any(),
                eq("Du wurdest zum Admin ernannt!"),
                eq("admin-promoted"),
                any()
        );
        verify(emailService, never()).sendEmail(
                any(),
                eq("Dein Benutzerkonto wurde durch einen Admin aktualisiert!"),
                eq("account-updated"),
                any()
        );
    }

    @Test
    void updateUser_SendsPasswordChangeEmail() {
        User existingUser = new User();
        existingUser.setPassword("oldHash");
        existingUser.setEmail("email");
        existingUser.setName("name");
        existingUser.setId(2L);
        existingUser.setRole(UserRole.ROLE_USER);



        User updatedUser = new User();
        updatedUser.setPassword("newPassword");
        updatedUser.setEmail("email");
        updatedUser.setName("name");
        updatedUser.setId(2L);


        when(userRepository.findById(any())).thenReturn(java.util.Optional.of(existingUser));
        when(passwordEncoder.encode("newPassword")).thenReturn("newHash");
        when(passwordEncoder.matches("newPassword", "oldHash")).thenReturn(false);

        adminService.updateUser(2L, updatedUser);

        verify(emailService).sendEmail(
                any(),
                eq("Dein Passwort wurde durch einen Admin geändert!"),
                eq("password-changed"),
                any()
        );
    }

    @Test
    void deleteUser_BlocksAdminDeletion() {
        User existingUser = new User();
        existingUser.setId(1L);
        existingUser.setRole(UserRole.ROLE_ADMIN);

        when(userRepository.findById(any())).thenReturn(java.util.Optional.of(existingUser));

        assertThatThrownBy(() -> adminService.deleteUser(1L))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("Der Admin-Benutzer kann nicht gelöscht werden.");
    }

    @Test
    void deleteUser_SendsDeletionEmailForValidUser() {
        User user = new User();
        user.setId(2L);
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(user));

        adminService.deleteUser(2L);

        verify(emailService).sendEmail(
                any(),
                eq("Dein Benutzerkonto wurde durch einen Admin gelöscht!"),
                eq("account-deleted"),
                any()
        );
        verify(userRepository).deleteById(2L);
    }

    @Test
    void deleteUser_ThrowsExceptionOnDeletionFailure() {
        User user = new User();
        user.setId(3L);
        when(userRepository.findById(3L)).thenReturn(java.util.Optional.of(user));
        doThrow(new RuntimeException("DB Error")).when(userRepository).deleteById(3L);

        assertThatThrownBy(() -> adminService.deleteUser(3L))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("DB Error");
    }
}