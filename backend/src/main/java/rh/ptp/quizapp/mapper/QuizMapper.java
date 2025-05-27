package rh.ptp.quizapp.mapper;

import rh.ptp.quizapp.dto.QuizDTO;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.model.User;

/**
 * Diese Klasse enthält statische Methoden zur Konvertierung zwischen {@link Quiz} und {@link QuizDTO}.
 */
public class QuizMapper {

    /**
     * Konvertiert ein {@link Quiz} Entity in ein {@link QuizDTO}.
     *
     * @param quiz Das Quiz-Entity
     * @return Das zugehörige QuizDTO oder {@code null}, wenn das Eingabeobjekt {@code null} ist
     */
    public static QuizDTO toDto(Quiz quiz) {
        if (quiz == null) {
            return null;
        }
        QuizDTO dto = new QuizDTO();
        dto.setId(quiz.getId());
        dto.setTitle(quiz.getTitle());
        dto.setDescription(quiz.getDescription());
        dto.setCreatorId(quiz.getCreator() != null ? quiz.getCreator().getId() : null);
        dto.setPublic(quiz.isPublic());
        dto.setDailyQuiz(quiz.isDailyQuiz());
        return dto;
    }

    /**
     * Konvertiert ein {@link QuizDTO} in ein {@link Quiz} Entity.
     * Wenn ein CreatorId gesetzt ist, wird ein neues {@link User} Objekt mit der ID erstellt.
     *
     * @param dto Das QuizDTO
     * @return Das zugehörige Quiz-Entity oder {@code null}, wenn das Eingabeobjekt {@code null} ist
     */
    public static Quiz toEntity(QuizDTO dto) {
        if (dto == null) {
            return null;
        }
        Quiz quiz = new Quiz();
        quiz.setId(dto.getId());
        quiz.setTitle(dto.getTitle());
        quiz.setDescription(dto.getDescription());
        if (dto.getCreatorId() != null) {
            User creator = new User();
            creator.setId(dto.getCreatorId());
            quiz.setCreator(creator);
        }
        quiz.setPublic(dto.isPublic());
        quiz.setDailyQuiz(dto.isDailyQuiz());
        return quiz;
    }
}