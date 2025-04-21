package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rh.ptp.quizapp.model.User;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByResetPasswordToken(String token);
    List<User> findByDailyQuizReminderIsNotNull();
    boolean existsByName(String name);
} 