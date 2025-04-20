package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.model.Quiz;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {
    List<Quiz> findByCreatorId(Long creatorId);
    @Transactional
    @Query("SELECT q from Quiz q where q.id = :quizId")
    Quiz findByQuizId(Long quizId);
    List<Quiz> findByIsDailyQuizTrueAndDate(LocalDate date);
    @Transactional
    @Modifying
    @Query("delete from Quiz q where q.creator.id = :userId")
    void deleteAllByCreatorId(@Param("userId") Long userId);
} 