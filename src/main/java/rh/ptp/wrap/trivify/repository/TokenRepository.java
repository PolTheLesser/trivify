package rh.ptp.wrap.trivify.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rh.ptp.wrap.trivify.model.entity.AuthenticationToken;
import rh.ptp.wrap.trivify.model.entity.User;

@Repository
public interface TokenRepository extends JpaRepository<AuthenticationToken, Long> {

    AuthenticationToken findByToken(String token);

    AuthenticationToken findByQuizUser(User user);
}
