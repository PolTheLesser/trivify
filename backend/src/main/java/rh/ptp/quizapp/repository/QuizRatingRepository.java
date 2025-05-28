package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.model.QuizRating;

import java.util.Optional;

/**
 * Repository für den Zugriff auf {@link rh.ptp.quizapp.model.QuizRating}.
 * Enthält Methoden zur Berechnung von Durchschnittsbewertungen, Zählungen und zur Bewertungspflege.
 */
public interface QuizRatingRepository extends JpaRepository<QuizRating, Long> {
    // Für Aggregation: Durchschnitt und Anzahl
    @Query("SELECT AVG(qr.rating) FROM QuizRating qr WHERE qr.quiz.id = :quizId")
    Double findAverageByQuizId(@Param("quizId") Long quizId);

    @Query("SELECT COUNT(qr) FROM QuizRating qr WHERE qr.quiz.id = :quizId")
    Long countByQuizId(@Param("quizId") Long quizId);

    @Modifying
    @Transactional
    @Query("DELETE FROM QuizRating qr WHERE qr.quiz.id = :quizId")
    void deleteByQuizId(@Param("quizId") Long quizId);

    Optional<QuizRating> findByQuizIdAndUserId(Long quizId, Long userId);
}
