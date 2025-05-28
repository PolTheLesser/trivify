package rh.ptp.quizapp.service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.repository.UserRepository;

/**
 * Service zum Laden von Benutzerdetails für die Spring Security.
 * <p>
 * Implementiert {@link UserDetailsService} zur Integration mit dem Authentifizierungsmechanismus.
 * </p>
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Konstruktor.
     *
     * @param userRepository Repository zum Zugriff auf Benutzer-Daten
     */
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Lädt einen Benutzer anhand des Benutzernamens (E-Mail-Adresse).
     *
     * @param username Die E-Mail-Adresse des Benutzers
     * @return UserDetails für die Authentifizierung
     * @throws UsernameNotFoundException wenn der Benutzer nicht gefunden wird
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("Benutzer nicht gefunden: " + username));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getAuthorities())
                .build();
    }
}