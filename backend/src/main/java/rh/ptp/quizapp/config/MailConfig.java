package rh.ptp.quizapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;

import java.util.Properties;

/**
 * Konfigurationsklasse zur Einrichtung des JavaMailSender mit SMTP-Eigenschaften.
 */
@Configuration
public class MailConfig {

    /** Benutzername für die SMTP-Authentifizierung. */
    @Value("${spring.mail.username}")
    private String username;

    /** Passwort für die SMTP-Authentifizierung. */
    @Value("${spring.mail.password}")
    private String userpwd;

    /** Hostname des SMTP-Servers. */
    @Value("${spring.mail.host}")
    private String host;

    /** Port des SMTP-Servers. */
    @Value("${spring.mail.port}")
    private int port;

    /**
     * Erstellt und konfiguriert eine JavaMailSender-Bean für den Mailversand.
     *
     * @return eine konfigurierte Instanz von {@link JavaMailSender}
     */
    @Bean
    public JavaMailSender javaMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost(host);
        mailSender.setPort(port);
        mailSender.setUsername(username);
        mailSender.setPassword(userpwd);

        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.debug", "true");

        return mailSender;
    }
}