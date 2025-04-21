package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rh.ptp.quizapp.model.RegistrationRequest;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RegistrationRequestRepository extends JpaRepository<RegistrationRequest, Long> {
    Optional<RegistrationRequest> findByVerificationToken(String token);
    boolean existsByEmail(String email);
    void deleteByCreatedAtBefore(LocalDateTime dateTime);
    boolean existsByName(String name);
} 