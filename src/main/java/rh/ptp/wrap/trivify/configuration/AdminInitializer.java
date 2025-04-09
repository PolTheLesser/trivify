package rh.ptp.wrap.trivify.configuration;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import rh.ptp.wrap.trivify.model.entity.User;
import rh.ptp.wrap.trivify.repository.UserRepository;

@Component
public class AdminInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@quizapp.com")) {
            User admin = new User()
                    .setUsername("Admin")
                    .setEmail("quiz_rh@gmx.de")
                    .setPassword(passwordEncoder.encode("admin123"))
                    .setEnabled(true);
            userRepository.save(admin);
        }
    }
}