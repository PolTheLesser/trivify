package rh.ptp.quizapp.mapper;

import org.junit.jupiter.api.Test;
import rh.ptp.quizapp.dto.QuizDTO;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.model.QuizCategory;
import rh.ptp.quizapp.model.User;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;


public class QuizMapperTest {

    @Test
    void toDto_NullInput_ReturnsNull() {
        QuizDTO result = QuizMapper.toDto(null);
        
        assertNull(result, "When input is null, result should be null");
    }

    @Test
    void toDto_ValidInput_ReturnsCorrectDTO() {
        User creator = new User();
        creator.setId(1L);
        creator.setName("Test User");
        
        Quiz quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Test Description");
        quiz.setCreator(creator);
        quiz.setPublic(true);
        
        List<QuizCategory> categories = new ArrayList<>();
        categories.add(QuizCategory.DAILY_QUIZ);
        quiz.setCategories(categories);
        
        QuizDTO result = QuizMapper.toDto(quiz);
        
        assertNotNull(result, "Result should not be null");
        assertEquals(quiz.getId(), result.getId(), "ID should match");
        assertEquals(quiz.getTitle(), result.getTitle(), "Title should match");
        assertEquals(quiz.getDescription(), result.getDescription(), "Description should match");
        assertEquals(quiz.getCreator().getId(), result.getCreatorId(), "Creator ID should match");
        assertEquals(quiz.isPublic(), result.isPublic(), "Public flag should match");
        assertTrue(result.isDailyQuiz(), "Daily quiz flag should be true");
    }

    @Test
    void toDto_NullCreator_ReturnsCorrectDTO() {
        Quiz quiz = new Quiz();
        quiz.setId(1L);
        quiz.setTitle("Test Quiz");
        quiz.setDescription("Test Description");
        quiz.setCreator(null);
        quiz.setPublic(true);
        
        QuizDTO result = QuizMapper.toDto(quiz);
        
        assertNotNull(result, "Result should not be null");
        assertEquals(quiz.getId(), result.getId(), "ID should match");
        assertEquals(quiz.getTitle(), result.getTitle(), "Title should match");
        assertEquals(quiz.getDescription(), result.getDescription(), "Description should match");
        assertNull(result.getCreatorId(), "Creator ID should be null");
        assertEquals(quiz.isPublic(), result.isPublic(), "Public flag should match");
    }

    @Test
    void toEntity_NullInput_ReturnsNull() {
        Quiz result = QuizMapper.toEntity(null);
        
        assertNull(result, "When input is null, result should be null");
    }

    @Test
    void toEntity_ValidInput_ReturnsCorrectEntity() {
        QuizDTO dto = new QuizDTO();
        dto.setId(1L);
        dto.setTitle("Test Quiz");
        dto.setDescription("Test Description");
        dto.setCreatorId(1L);
        dto.setPublic(true);
        dto.setDailyQuiz(true);
        
        Quiz result = QuizMapper.toEntity(dto);
        
        assertNotNull(result, "Result should not be null");
        assertEquals(dto.getId(), result.getId(), "ID should match");
        assertEquals(dto.getTitle(), result.getTitle(), "Title should match");
        assertEquals(dto.getDescription(), result.getDescription(), "Description should match");
        assertNotNull(result.getCreator(), "Creator should not be null");
        assertEquals(dto.getCreatorId(), result.getCreator().getId(), "Creator ID should match");
        assertEquals(dto.isPublic(), result.isPublic(), "Public flag should match");
        assertTrue(result.isDailyQuiz(), "Daily quiz flag should be true");
    }

    @Test
    void toEntity_NullCreatorId_ReturnsCorrectEntity() {
        QuizDTO dto = new QuizDTO();
        dto.setId(1L);
        dto.setTitle("Test Quiz");
        dto.setDescription("Test Description");
        dto.setCreatorId(null);
        dto.setPublic(true);
        
        Quiz result = QuizMapper.toEntity(dto);
        
        assertNotNull(result, "Result should not be null");
        assertEquals(dto.getId(), result.getId(), "ID should match");
        assertEquals(dto.getTitle(), result.getTitle(), "Title should match");
        assertEquals(dto.getDescription(), result.getDescription(), "Description should match");
        assertNull(result.getCreator(), "Creator should be null");
        assertEquals(dto.isPublic(), result.isPublic(), "Public flag should match");
    }
}