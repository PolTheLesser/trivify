package rh.ptp.quizapp.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "app")
public class SecretsConfig {
    private String jwtSecret;
    private long jwtExpirationInMs;
    private String mailUsername;
    private String mailPassword;
    private String mailHost;
    private int mailPort;
    private String frontendUrl;
    private String adminPassword;

}