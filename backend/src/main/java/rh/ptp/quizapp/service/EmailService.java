package rh.ptp.quizapp.service;

import jakarta.mail.internet.InternetAddress;
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

/**
 * Service zur Verwaltung und zum Versand von E-Mails.
 * <p>
 * Verwendet Thymeleaf zur Template-Verarbeitung und JavaMailSender zum Versand.
 * Prüft vor dem Versand den Benutzerstatus, um unerwünschte E-Mails zu vermeiden.
 * </p>
 */
@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);
    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private final String mailFrom;

    @Value("${spring.mail.answer-to}")
    private final String answerTo;

    /**
     * Konstruktor mit Dependency Injection.
     *
     * @param mailSender     JavaMailSender für den E-Mail-Versand
     * @param templateEngine Thymeleaf TemplateEngine zur Verarbeitung von Templates
     * @param secretsConfig  Konfiguration zur sicheren Beschaffung von geheimen Werten
     * @param userRepository Repository zur Abfrage von Benutzerdaten
     */
    @Autowired
    public EmailService(JavaMailSender mailSender,
                        TemplateEngine templateEngine,
                        SecretsConfig secretsConfig,
                        UserRepository userRepository) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.mailFrom = secretsConfig.getMailUsername();
        this.answerTo = secretsConfig.getMailAnswerTo();
        this.userRepository = userRepository;
    }

    /**
     * Sendet eine E-Mail mit dem angegebenen Betreff und Template an den Empfänger.
     * <p>
     * Das Template wird mit den bereitgestellten Variablen gerendert.
     * Vor dem Versand wird geprüft, ob der Benutzerstatus den Versand erlaubt.
     * </p>
     *
     * @param to           Empfänger-E-Mail-Adresse
     * @param subject      Betreff der E-Mail
     * @param templateName Name des Thymeleaf-Templates
     * @param variables    Variablen zur Template-Verarbeitung
     * @throws RuntimeException bei Fehlern im Versandprozess
     */
    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        variables.put("supportEmail", answerTo);
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

            helper.setFrom(new InternetAddress(mailFrom, "Trivify"));
            helper.setReplyTo(new InternetAddress(answerTo, "Trivify-Support"));
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