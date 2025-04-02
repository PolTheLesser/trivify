package rh.ptp.wrap.trivify.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rh.ptp.wrap.trivify.model.entity.User;
import rh.ptp.wrap.trivify.model.entity.VerificationToken;

@Repository
public interface TokenRepository extends JpaRepository<VerificationToken, Long> {

    VerificationToken findByToken(String token);

    VerificationToken findByQuizUser(User user);
}
