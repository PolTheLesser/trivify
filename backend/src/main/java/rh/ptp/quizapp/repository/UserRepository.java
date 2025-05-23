package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserStatus;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    List<User> findByDailyQuizReminderIsTrue();
    boolean existsByName(String name);
    void deleteById(long userId);
    List<User> findAllByCreatedAtBeforeAndUserStatusIn(LocalDateTime warningTime, List<UserStatus> statuses);
    void deleteAllByCreatedAtBeforeAndUserStatusIn(LocalDateTime dateTime, List<UserStatus> statuses);
} 