package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import rh.ptp.quizapp.model.AuthenticationToken;
import rh.ptp.quizapp.model.User;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AuthenticationTokenRepository extends JpaRepository<AuthenticationToken, Long> {
    Optional<AuthenticationToken> findByToken(String token);

    @Query("select at.id from AuthenticationToken at where at.token = ?1")
    Optional<Long> findIdByToken(String token);

    AuthenticationToken findByQuizUser(User user);

    @Query("SELECT t.quizUser FROM AuthenticationToken t WHERE t.expiryDate < :expiryDate")
    List<User> findQuizUserByExpiryDateBefore(@Param("expiryDate") LocalDateTime date);

    @Query("SELECT a.token FROM AuthenticationToken a WHERE a.quizUser = :user")
    String findTokenByQuizUser(@Param("user") User user);

    @Query("SELECT t.quizUser FROM AuthenticationToken t WHERE t.token = :token")
    Optional<User> findQuizUserByToken(@Param("token") String token);

    void deleteAllByExpiryDateBefore(LocalDateTime date);

    void deleteAllById(Long id);
}
