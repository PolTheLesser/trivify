package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.model.Question;
import rh.ptp.quizapp.model.QuizQuestion;

/**
 * Repository für den Zugriff auf {@link rh.ptp.quizapp.model.Question} und {@link rh.ptp.quizapp.model.QuizQuestion}.
 * Beinhaltet benutzerdefinierte Abfragen zur Löschung und Auswahl von Quizfragen.
 */
public interface QuestionRepository extends JpaRepository<Question, Long> {
    @Query("SELECT f FROM QuizQuestion f WHERE f.id = :id")
    QuizQuestion findByIdCustom(@Param("id") Long id);
    @Transactional
    @Modifying
    @Query("delete from QuizQuestion q where q.quiz.creator.id = :userId")
    void deleteAllByQuizCreatorId(@Param("userId") Long userId);
}