package rh.ptp.quizapp.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import rh.ptp.quizapp.dto.QuizDTO;
import rh.ptp.quizapp.dto.QuizQuestionDTO;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.model.QuizCategory;
import rh.ptp.quizapp.model.QuizQuestion;
import rh.ptp.quizapp.repository.*;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class QuizServiceTest {

    @Mock
    private QuizRepository quizRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private QuizResultRepository quizResultRepository;
    @Mock
    private QuizQuestionRepository quizQuestionRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private QuizRatingRepository quizRatingRepository;
    @Mock
    private QuizFavoriteRepository quizFavoriteRepository;
    @Mock
    private UserService userService;

    @InjectMocks
    private QuizService quizService;

    private final Long userId = 1L;
    private final Long quizId = 10L;
    private final Long questionId = 100L;
    private Quiz quiz;
    private rh.ptp.quizapp.model.User creator;
    private QuizDTO quizDTO;

    @BeforeEach
    void setUp() {
        creator = new rh.ptp.quizapp.model.User();
        creator.setId(userId);

        quiz = new Quiz();
        quiz.setId(quizId);
        quiz.setCreator(creator);
        quiz.setCategories(new ArrayList<>(List.of(QuizCategory.HISTORY)));

        quizDTO = new QuizDTO();
        quizDTO.setTitle("Test Quiz");
        quizDTO.setCategories(new ArrayList<>(List.of(QuizCategory.SCIENCE)));
        quizDTO.setQuestions(new ArrayList<>());
    }

    @Test
    void getQuizById_Exists_ReturnsQuiz() {
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        assertEquals(quiz, quizService.getQuizById(quizId));
    }

    @Test
    void getQuizById_NotFound_ThrowsException() {
        when(quizRepository.findById(quizId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> quizService.getQuizById(quizId));
    }

    @Test
    void createQuiz_ValidData_SavesQuiz() {
        when(userRepository.findById(userId)).thenReturn(Optional.of(creator));
        when(quizRepository.save(any(Quiz.class))).thenReturn(quiz);

        Quiz result = quizService.createQuiz(quizDTO, userId);
        assertNotNull(result);
        verify(quizRepository).save(any(Quiz.class));
    }

    @Test
    void createQuiz_UserNotFound_ThrowsException() {
        when(userRepository.findById(userId)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> quizService.createQuiz(quizDTO, userId));
    }

    @Test
    void updateQuiz_Creator_SuccessfulUpdate() {
        List<QuizQuestion> existingQuestions = new ArrayList<>();
        QuizQuestion existingQ = new QuizQuestion();
        existingQ.setId(1L);
        existingQuestions.add(existingQ);
        quiz.setQuestions(existingQuestions);

        QuizQuestionDTO newQuestionDTO = new QuizQuestionDTO();
        newQuestionDTO.setQuestion("New question");
        newQuestionDTO.setAnswers(List.of("A", "B"));
        newQuestionDTO.setCorrectAnswer("A");
        quizDTO.setQuestions(List.of(newQuestionDTO));

        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        when(quizRepository.save(any())).thenReturn(quiz);

        Quiz result = quizService.updateQuiz(quizId, quizDTO, userId);

        assertNotNull(result);
        assertEquals(1, result.getQuestions().size());
        verify(quizRepository).save(quiz);
    }

    @Test
    void updateQuiz_NonCreator_ThrowsException() {
        quiz.setCreator(new rh.ptp.quizapp.model.User());
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));

        assertThrows(RuntimeException.class,
                () -> quizService.updateQuiz(quizId, quizDTO, userId));
    }

    @Test
    void deleteQuiz_Creator_DeletesQuiz() {
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));
        quizService.deleteQuiz(quizId, userId);
        verify(quizRepository).delete(quiz);
    }

    @Test
    void getDailyQuiz_Found_ReturnsDTO() {
        List<QuizQuestion> questions = new ArrayList<>();
        QuizQuestion question = new QuizQuestion();
        question.setId(1L);
        question.setQuestion("Test question");
        question.setAnswers(List.of("A", "B", "C"));
        question.setCorrectAnswer("A");
        questions.add(question);

        quiz.setQuestions(questions);
        quiz.getCategories().add(QuizCategory.DAILY_QUIZ);

        when(quizRepository.findByCategoriesAndDate(eq(QuizCategory.DAILY_QUIZ), any(LocalDate.class)))
                .thenReturn(List.of(quiz));

        QuizDTO result = quizService.getDailyQuiz();

        assertNotNull(result);
        assertEquals(quizId, result.getId());
        assertEquals(1, result.getQuestions().size());
        assertEquals("Test question", result.getQuestions().get(0).getQuestion());
    }

    @Test
    void getDailyQuiz_NoQuestions_ThrowsException() {
        quiz.getCategories().add(QuizCategory.DAILY_QUIZ);
        quiz.setQuestions(Collections.emptyList());

        when(quizRepository.findByCategoriesAndDate(any(), any()))
                .thenReturn(List.of(quiz));

        assertThrows(RuntimeException.class, () -> quizService.getDailyQuiz());
    }

    @Test
    void getDailyQuiz_NotFound_ThrowsException() {
        when(quizRepository.findByCategoriesAndDate(any(), any())).thenReturn(Collections.emptyList());
        assertThrows(RuntimeException.class, () -> quizService.getDailyQuiz());
    }

    @Test
    void checkAnswer_Correct_ReturnsTrue() {
        assertTrue(quizService.checkAnswer("answer", "answer"));
    }

    @Test
    void checkAnswer_Incorrect_ReturnsFalse() {
        assertFalse(quizService.checkAnswer("wrong", "answer"));
    }

    @Test
    void rateQuiz_RatingOwnQuiz_ThrowsException() {
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));

        assertThrows(RuntimeException.class, () -> quizService.rateQuiz(quizId, userId, 4));
    }

    @Test
    void toggleFavorite_AddsFavorite_ReturnsTrue() {

        UserDetails userDetails = mock(UserDetails.class);

        rh.ptp.quizapp.model.User user = new rh.ptp.quizapp.model.User();

        user.setId(userId);

        when(userService.getUserFromUserDetails(userDetails)).thenReturn(user);

        when(quizRepository.findById(quizId)).thenReturn(Optional.of(quiz));

        when(quizFavoriteRepository.findByUserIdAndQuizId(userId, quizId))

                .thenReturn(Optional.empty());

        assertTrue(quizService.toggleFavorite(quizId, userDetails));

        verify(quizFavoriteRepository).save(any());

    }

    @Test
    void validateQuizDTO_EmptyTitle_ThrowsException() {
        quizDTO.setTitle("");
        assertThrows(IllegalArgumentException.class,
                () -> quizService.validateQuizDTO(quizDTO));
    }

    @Test
    void validateQuizDTO_DuplicateAnswers_ThrowsException() {
        QuizQuestionDTO question = new QuizQuestionDTO();
        question.setQuestion("Q1");
        question.setAnswers(List.of("A", "A"));
        question.setCorrectAnswer("A");
        quizDTO.setQuestions(List.of(question));

        assertThrows(IllegalArgumentException.class,
                () -> quizService.validateQuizDTO(quizDTO));
    }

    @Test
    void updateDailyQuiz_ValidInput_CreatesQuiz() {
        JSONArray questions = new JSONArray();
        JSONObject q1 = new JSONObject();
        q1.put("Frage", "Question?");
        q1.put("Antworten", new JSONArray(List.of("A1", "A2")));
        q1.put("RichtigeAntwort", "A1");
        questions.put(q1);

        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());

        quizService.updateDailyQuiz(questions, QuizCategory.SCIENCE);
        verify(quizRepository).save(any(Quiz.class));
    }
}