package rh.ptp.quizapp.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public class AccountCleanupRepository {

    @PersistenceContext
    private EntityManager em;

    /**
     * 0) Delete all quiz results of this user
     */
    @Transactional
    public void deleteAllQuizResultsByUser(long userId) {
        em.createNativeQuery("DELETE FROM quiz_results WHERE user_id = :userId")
                .setParameter("userId", userId)
                .executeUpdate();
    }

    /**
     * 1) Delete all ratings for quizzes this user created
     */
    @Transactional
    public void deleteAllQuizRatingsByUser(long userId) {
        em.createNativeQuery(
                        "DELETE FROM quiz_ratings " +
                                " WHERE quiz_id IN ( " +
                                "   SELECT id FROM quizzes WHERE creator_id = :userId" +
                                ")"
                )
                .setParameter("userId", userId)
                .executeUpdate();
    }

    /**
     * 2) Delete all answers to quizzes this user created
     */
    @Transactional
    public void deleteAllQuestionAnswersByUser(long userId) {
        em.createNativeQuery(
                        "DELETE FROM question_answers qa " +
                                " WHERE qa.question_id IN ( " +
                                "   SELECT qq.id FROM quiz_questions qq " +
                                "    JOIN quizzes q ON qq.quiz_id = q.id " +
                                "   WHERE q.creator_id = :userId " +
                                ")"
                )
                .setParameter("userId", userId)
                .executeUpdate();
    }

    /**
     * 3) Delete all quiz‑questions in quizzes this user created
     */
    @Transactional
    public void deleteAllQuizQuestionsByUser(long userId) {
        em.createNativeQuery(
                        "DELETE FROM quiz_questions " +
                                " WHERE quiz_id IN ( " +
                                "   SELECT id FROM quizzes WHERE creator_id = :userId" +
                                ")"
                )
                .setParameter("userId", userId)
                .executeUpdate();
    }

    /**
     * 4) Delete all quizzes this user created
     */
    @Transactional
    public void deleteAllQuizzesByUser(long userId) {
        em.createNativeQuery(
                        "DELETE FROM quizzes WHERE creator_id = :userId"
                )
                .setParameter("userId", userId)
                .executeUpdate();
    }
}
