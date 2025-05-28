package rh.ptp.quizapp.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Konfigurationsklasse zum Zugriff auf geheime Anwendungseigenschaften mit dem Prefix "app".
 * Werte werden auf Basis der `application-template.yml` aus einem speziell dafür angelegten GitHub-Repository gezogen.
 */
@Configuration
@Data
@ConfigurationProperties(prefix = "app")
public class SecretsConfig {

    /** Secret für die Signierung von JWTs. */
    private String jwtSecret;

    /** Gültigkeitsdauer von JWTs in Millisekunden. */
    private long jwtExpirationInMs;

    /** Benutzername für das Mail-System. */
    private String mailUsername;

    /** Passwort für das Mail-System. */
    private String mailPassword;

    /** Hostname des Mail-Servers. */
    private String mailHost;

    /** Port des Mail-Servers. */
    private int mailPort;

    /** URL der Frontend-Anwendung. */
    private String frontendUrl;

    /** Admin-Passwort für administrative Funktionen. */
    private String adminPassword;
}