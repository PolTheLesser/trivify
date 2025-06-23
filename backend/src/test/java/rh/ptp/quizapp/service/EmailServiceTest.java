package rh.ptp.quizapp.service;

import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import rh.ptp.quizapp.config.SecretsConfig;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.UserRepository;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private TemplateEngine templateEngine;

    @Mock
    private SecretsConfig secretsConfig;

    @Mock
    private MimeMessage mimeMessage;

    private EmailService emailService;

    private final String testEmail = "test@example.com";
    private final String subject = "Test Subject";
    private final String template = "test-template";

    @BeforeEach
    void setUp() {
        when(secretsConfig.getMailUsername()).thenReturn("from@example.com");
        when(secretsConfig.getMailAnswerTo()).thenReturn("reply@example.com");
        emailService = new EmailService(mailSender, templateEngine, secretsConfig, userRepository);
    }

    @Test
    void sendEmail_ActiveUser_SendsEmail() throws Exception {
        Map<String, Object> variables = new HashMap<>();
        variables.put("key", "value");

        User activeUser = new User();
        activeUser.setUserStatus(UserStatus.ACTIVE);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(activeUser));
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("<html>Content</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendEmail(testEmail, subject, template, variables);

        verify(mailSender).send(mimeMessage);
    }

    @Test
    void sendEmail_BlockedUserNonExceptionTemplate_SkipsSending() {
        Map<String, Object> variables = new HashMap<>();
        variables.put("key", "value");

        User blockedUser = new User();
        blockedUser.setUserStatus(UserStatus.BLOCKED);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(blockedUser));

        emailService.sendEmail(testEmail, subject, "non-exception-template", variables);

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    void sendEmail_SendingFails_ThrowsRuntimeException() throws Exception {
        Map<String, Object> variables = new HashMap<>();
        variables.put("key", "value");

        User activeUser = new User();
        activeUser.setUserStatus(UserStatus.ACTIVE);

        when(userRepository.findByEmail(testEmail)).thenReturn(Optional.of(activeUser));
        when(templateEngine.process(anyString(), any(Context.class))).thenReturn("<html>Content</html>");
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailException("Simulated error") {}).when(mailSender).send(mimeMessage);

        RuntimeException exception = assertThrows(RuntimeException.class,
                () -> emailService.sendEmail(testEmail, subject, template, variables)
        );

        assertEquals("Fehler beim Senden der E-Mail", exception.getMessage());
        assertTrue(exception.getCause() instanceof MailException);
    }
}