package rh.ptp.quizapp.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.Query;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import rh.ptp.quizapp.model.AuthenticationToken;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.AuthenticationTokenRepository;
import rh.ptp.quizapp.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CleanupRepositoryServiceTest {

    @Mock private EntityManager em;
    @Mock private UserRepository userRepository;
    @Mock private AuthenticationTokenRepository authTokenRepository;
    @Mock private EmailService emailService;
    @Mock private Query query;

    @InjectMocks private CleanupRepositoryService cleanupService;

    @Test
    void deleteQuizResults_ExecutesCorrectQuery() {
        when(em.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        cleanupService.deleteAllQuizResultsByUser(1L);
        verify(em).createNativeQuery("DELETE FROM quiz_results WHERE user_id = :userId");
        verify(query).setParameter("userId", 1L);
        verify(query).executeUpdate();
    }

    @Test
    void prepareDelete_DeletesDependenciesAndToken() {
        when(em.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        User user = new User();
        user.setId(1L);
        AuthenticationToken token = new AuthenticationToken();

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(authTokenRepository.findByQuizUser(user)).thenReturn(token);

        cleanupService.prepareDelete(1L);

        verify(em, times(3)).createNativeQuery(anyString());
        verify(authTokenRepository).delete(token);
    }

    @Test
    void prepareDelete_WhenNoToken_DoesNotDeleteToken() {
        when(em.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        User user = new User();
        user.setId(1L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));
        when(authTokenRepository.findByQuizUser(user)).thenReturn(null);

        cleanupService.prepareDelete(1L);

        verify(authTokenRepository, never()).delete(any());
    }

    @Test
    void prepareDelete_WhenUserNotFound_ThrowsException() {
        when(em.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        when(userRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> cleanupService.prepareDelete(1L));
    }

    @Test
    void completeDeletion_SendsWarningForPendingDeletes() {
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setName("User");
        user.setUserStatus(UserStatus.PENDING_DELETE);
        user.setUpdatedAt(LocalDateTime.now().minusDays(7));

        when(userRepository.findAllByUpdatedAtBeforeAndUserStatusIn(
                any(LocalDateTime.class),
                anyList()
        )).thenReturn(List.of(user)).thenReturn(Collections.emptyList());
        when(authTokenRepository.findTokenByQuizUser(user)).thenReturn("token123");

        cleanupService.completeDeletionRequests();

        verify(emailService).sendEmail(
                eq("test@example.com"),
                eq("Erinnerung: Account-Löschung"),
                eq("account-delete-warning"),
                anyMap()
        );
    }

    @Test
    void completeDeletion_DeletesExpiredRequests() {
        when(em.createNativeQuery(anyString())).thenReturn(query);
        when(query.setParameter(anyString(), any())).thenReturn(query);
        User user = new User();
        user.setId(1L);
        user.setEmail("test@example.com");
        user.setName("User");
        user.setUserStatus(UserStatus.PENDING_DELETE);
        user.setUpdatedAt(LocalDateTime.now().minusDays(8));

        when(userRepository.findAllByUpdatedAtBeforeAndUserStatusIn(
                any(LocalDateTime.class),
                anyList()
        )).thenReturn(Collections.emptyList())
                .thenReturn(List.of(user));

        when(userRepository.findById(1L)).thenReturn(Optional.of(user));

        when(authTokenRepository.findByQuizUser(user)).thenReturn(null);

        doNothing().when(authTokenRepository).deleteAllByExpiryDateBefore(any());

        cleanupService.completeDeletionRequests();

        verify(emailService).sendEmail(
                eq("test@example.com"),
                eq("Deine Benutzerdaten wurden gelöscht!"),
                eq("account-deleted"),
                anyMap()
        );

        verify(userRepository).deleteAllByUpdatedAtBeforeAndUserStatusIn(any(), anyList());
    }


    @Test
    void deleteTokens_DeletesExpiredTokensAndUsers() {
        User unverifiedUser = new User();
        unverifiedUser.setId(1L);
        unverifiedUser.setUserStatus(UserStatus.PENDING_VERIFICATION);

        when(authTokenRepository.findQuizUserByExpiryDateBefore(any()))
                .thenReturn(List.of(unverifiedUser));

        cleanupService.deleteOldTokens();

        verify(authTokenRepository).deleteAllByExpiryDateBefore(any());
        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteTokens_IgnoresActiveUsers() {
        User activeUser = new User();
        activeUser.setId(1L);
        activeUser.setUserStatus(UserStatus.ACTIVE);

        when(authTokenRepository.findQuizUserByExpiryDateBefore(any()))
                .thenReturn(List.of(activeUser));

        cleanupService.deleteOldTokens();

        verify(authTokenRepository).deleteAllByExpiryDateBefore(any());
        verify(userRepository, never()).deleteById(any());
    }
}