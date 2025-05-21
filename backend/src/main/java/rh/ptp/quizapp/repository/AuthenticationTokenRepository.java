package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rh.ptp.quizapp.model.AuthenticationToken;
import rh.ptp.quizapp.model.User;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AuthenticationTokenRepository extends JpaRepository<AuthenticationToken, Long> {
    Optional<AuthenticationToken> findByToken(String token);
    Optional<Long> findIdByToken(String token);
    AuthenticationToken findByQuizUser(User user);

    @Query("SELECT a.token FROM AuthenticationToken a WHERE a.quizUser = :user")
    String findTokenByQuizUser(@Param("user") User user);
    void deleteAllByExpiryDateBefore(LocalDateTime date);
    void deleteAllById(Long id);
}
