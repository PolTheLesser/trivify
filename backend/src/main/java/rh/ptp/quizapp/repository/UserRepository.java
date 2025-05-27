package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository zur Verwaltung von {@link rh.ptp.quizapp.model.User} Entitäten.
 * Bietet Suchfunktionen nach E-Mail, Name oder Status sowie Möglichkeiten zur Löschung und Statusprüfung.
 */
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByName(String name);
    boolean existsByEmail(String email);
    List<User> findByDailyQuizReminderIsTrue();
    boolean existsByName(String name);
    void deleteById(long userId);
    List<User> findAllByCreatedAtBeforeAndUserStatusIn(LocalDateTime warningTime, List<UserStatus> statuses);
    void deleteAllByCreatedAtBeforeAndUserStatusIn(LocalDateTime dateTime, List<UserStatus> statuses);
} 