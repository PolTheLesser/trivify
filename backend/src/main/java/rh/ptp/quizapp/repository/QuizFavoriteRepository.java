package rh.ptp.quizapp.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.model.QuizFavorite;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuizFavoriteRepository extends JpaRepository<QuizFavorite, Long> {
    Optional<QuizFavorite> findByUserIdAndQuizId(Long userId, Long quizId);
    List<QuizFavorite> findAllByUserId(Long userId);
    void deleteByQuizId(Long quizId);
}