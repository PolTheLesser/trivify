package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rh.ptp.quizapp.model.QuizQuestion;

/**
 * Repository für QuizQuestion-Entities.
 * Liefert out-of-the-box Methoden wie findById, findAll, save, deleteById, …
 */
public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
}