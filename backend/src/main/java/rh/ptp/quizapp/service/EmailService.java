package rh.ptp.quizapp.service;

import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.config.SecretsConfig;
import rh.ptp.quizapp.repository.UserRepository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    @Value("${spring.mail.username}")
    private final String mailFrom;

    @Autowired
    public EmailService(JavaMailSender mailSender, 
                       TemplateEngine templateEngine,
                       SecretsConfig secretsConfig,
                        UserRepository userRepository) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.mailFrom = secretsConfig.getMailUsername();
        this.userRepository = userRepository;
    }

    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
            if (!userRepository.findByEmail(to)
                    .map(user -> user.getUserStatus() != UserStatus.PENDING_VERIFICATION && user.getUserStatus() != UserStatus.BLOCKED)
                    .orElse(false)) {
                List<String> exeptionEmails = new ArrayList<>();
                exeptionEmails.add("account-delete-info");
                exeptionEmails.add("account-delete-warning");
                exeptionEmails.add("account-deleted");
                exeptionEmails.add("account-reactivated");
                exeptionEmails.add("password-reset-email");
                exeptionEmails.add("registration-delete-warning");
                exeptionEmails.add("verification-email");
                if(!exeptionEmails.contains(templateName)) {
                    return;
                }
            }
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom);
            helper.setTo(to);
            helper.setSubject(subject);

            Context context = new Context();
            context.setVariables(variables);
            String htmlContent = templateEngine.process(templateName, context);

            helper.setText(htmlContent, true);

            mailSender.send(message);
            logger.info("E-Mail erfolgreich gesendet an: {}", to);
        } catch (Exception e) {
            logger.error("Fehler beim Senden der E-Mail an {}: {}", to, e.getMessage());
            throw new RuntimeException("Fehler beim Senden der E-Mail", e);
        }
    }
}