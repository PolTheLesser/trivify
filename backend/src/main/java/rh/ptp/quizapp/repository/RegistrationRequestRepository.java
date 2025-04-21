package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.model.RegistrationRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
    Optional<RegistrationRequest> findByVerificationToken(String token);
    boolean existsByEmail(String email);
    void deleteAllByCreatedAtBefore(LocalDateTime dateTime);
    @Transactional
    List<RegistrationRequest> findAllByCreatedAtBefore(LocalDateTime dateTime);
    boolean existsByName(String name);
} 