package rh.ptp.wrap.trivify.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rh.ptp.wrap.trivify.model.entity.old.EmailAuthenticationToken;
import rh.ptp.wrap.trivify.model.entity.old.User;

@Repository
public interface TokenRepository extends JpaRepository<EmailAuthenticationToken, Long> {

    EmailAuthenticationToken findByToken(String token);

    EmailAuthenticationToken findByQuizUser(User user);

    boolean existsByQuizUser(User user);
}
