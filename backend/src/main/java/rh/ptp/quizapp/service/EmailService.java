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
import rh.ptp.quizapp.config.SecretsConfig;

import java.util.Map;

@Service
public class EmailService {
    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    @Value("${spring.mail.username}")
    private final String mailFrom;

    @Autowired
    public EmailService(JavaMailSender mailSender, 
                       TemplateEngine templateEngine,
                       SecretsConfig secretsConfig) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.mailFrom = secretsConfig.getMailUsername();
    }

    public void sendEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        try {
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