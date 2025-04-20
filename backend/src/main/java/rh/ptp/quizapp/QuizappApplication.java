package rh.ptp.quizapp;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.EnableScheduling;
import rh.ptp.quizapp.config.SecretsConfig;

@SpringBootApplication
@EnableScheduling
@EnableConfigurationProperties(SecretsConfig.class)
public class QuizappApplication {
    public static void main(String[] args) {
        SpringApplication.run(QuizappApplication.class, args);
    }
}
