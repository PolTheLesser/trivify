package rh.ptp.quizapp.repository;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.model.QuizCategory;
import rh.ptp.quizapp.model.QuizResult;

import java.time.LocalDateTime;
import java.util.List;

public interface QuizResultRepository extends JpaRepository<QuizResult, Long> {
    List<QuizResult> findByUserId(Long userId);

    List<QuizResult> findByQuizId(Long quizId);

    boolean existsByUserIdAndQuizCategoriesAndPlayedAtAfter(Long userId, QuizCategory category, LocalDateTime date);

    @Transactional
    @Modifying
    @Query("delete from QuizResult r where r.user.id = :userId")
    void deleteAllByUserId(Long userId);

    @Query("""
            SELECT qr.user.id, SUM(qr.score)
            FROM QuizResult qr
            WHERE qr.id IN (
                SELECT MIN(q.id)
                FROM QuizResult q
                WHERE q.quiz.creator.id != q.user.id
                GROUP BY q.user.id, q.quiz.id
            )
            GROUP BY qr.user.id
            ORDER BY SUM(qr.score) DESC
            """)
    List<Object[]> findTopUserScores(Pageable pageable);


    @Query("""
            SELECT qr.user.id, SUM(qr.score)
            FROM QuizResult qr
            WHERE qr.id IN (
                SELECT MIN(q.id)
                FROM QuizResult q
                WHERE q.quiz.creator.id != q.user.id
                GROUP BY q.user.id, q.quiz.id
            )
            GROUP BY qr.user.id
            ORDER BY SUM(qr.score) DESC
            """)
    List<Object[]> findAllUserScoresOrdered();

    @Modifying
    @Transactional
    @Query("DELETE FROM QuizResult qr WHERE qr.quiz.id = :quizId")
    void deleteByQuizId(@Param("quizId") Long quizId);

}