package rh.ptp.quizapp.service;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageRequest;
import rh.ptp.quizapp.dto.ScoreDTO;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.model.QuizResult;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.repository.QuizRepository;
import rh.ptp.quizapp.repository.QuizResultRepository;
import rh.ptp.quizapp.repository.UserRepository;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class QuizResultServiceTest {

    @Mock
    private QuizResultRepository quizResultRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private QuizRepository quizRepository;

    @InjectMocks
    private QuizResultService quizResultService;

    @Test
    void saveResult_ValidInput_ReturnsSavedResult() {
        Long userId = 1L;
        Long quizId = 1L;
        User mockUser = new User();
        Quiz mockQuiz = new Quiz();
        QuizResult expectedResult = new QuizResult();

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(quizRepository.findById(quizId)).thenReturn(Optional.of(mockQuiz));
        when(quizResultRepository.save(any(QuizResult.class))).thenReturn(expectedResult);

        QuizResult actualResult = quizResultService.saveResult(userId, quizId, 5, 10);

        assertNotNull(actualResult);
        verify(quizResultRepository).save(any(QuizResult.class));
    }

    @Test
    void saveResult_UserNotFound_ThrowsException() {
        Long userId = 1L;
        when(userRepository.findById(userId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                quizResultService.saveResult(userId, 1L, 5, 10)
        );
    }

    @Test
    void saveResult_QuizNotFound_ThrowsException() {
        Long userId = 1L;
        Long quizId = 1L;
        User mockUser = new User();

        when(userRepository.findById(userId)).thenReturn(Optional.of(mockUser));
        when(quizRepository.findById(quizId)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                quizResultService.saveResult(userId, quizId, 5, 10)
        );
    }

    @Test
    void getUserResults_ExistingUser_ReturnsResults() {
        Long userId = 1L;
        List<QuizResult> expectedResults = Collections.singletonList(new QuizResult());
        when(quizResultRepository.findByUserId(userId)).thenReturn(expectedResults);

        List<QuizResult> actualResults = quizResultService.getUserResults(userId);

        assertEquals(expectedResults, actualResults);
    }

    @Test
    void getUserResults_NoResults_ReturnsEmptyList() {
        Long userId = 1L;
        when(quizResultRepository.findByUserId(userId)).thenReturn(Collections.emptyList());

        List<QuizResult> results = quizResultService.getUserResults(userId);

        assertTrue(results.isEmpty());
    }

    @Test
    void getQuizResults_ExistingQuiz_ReturnsResults() {
        Long quizId = 1L;
        List<QuizResult> expectedResults = Collections.singletonList(new QuizResult());
        when(quizResultRepository.findByQuizId(quizId)).thenReturn(expectedResults);

        List<QuizResult> actualResults = quizResultService.getQuizResults(quizId);

        assertEquals(expectedResults, actualResults);
    }

    @Test
    void getQuizResults_NoResults_ReturnsEmptyList() {
        Long quizId = 1L;
        when(quizResultRepository.findByQuizId(quizId)).thenReturn(Collections.emptyList());

        List<QuizResult> results = quizResultService.getQuizResults(quizId);

        assertTrue(results.isEmpty());
    }

    @Test
    void getTopScores_ValidData_ReturnsTop10() {
        Object[] mockEntry = {1L, 100};
        when(quizResultRepository.findTopUserScores(PageRequest.of(0, 10)))
                .thenReturn(Collections.singletonList(mockEntry));
        when(userRepository.findById(1L)).thenReturn(Optional.of(new User().setName("testUser")));

        List<ScoreDTO> scores = quizResultService.getTopScores();

        assertEquals(1, scores.size());
        assertEquals("testUser", scores.get(0).getUsername());
        assertEquals(100, scores.get(0).getScore());
        assertEquals(-1, scores.get(0).getRank());
    }

    @Test
    void getTopScores_UserNotFound_HandlesGracefully() {
        Object[] mockEntry = {1L, 100};
        when(quizResultRepository.findTopUserScores(any())).thenReturn(Collections.singletonList(mockEntry));
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        List<ScoreDTO> scores = quizResultService.getTopScores();

        assertEquals("Unbekannt", scores.get(0).getUsername());
    }

    @Test
    void getUserScoreAndRank_UserFound_ReturnsScoreAndRank() {
        Long userId = 1L;
        Object[] mockEntry1 = {userId, 100L};
        Object[] mockEntry2 = {2L, 90L};

        when(quizResultRepository.findAllUserScoresOrdered())
                .thenReturn(List.of(mockEntry1, mockEntry2));

        User user = new User();
        user.setName("testUser");
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        ScoreDTO result = quizResultService.getUserScoreAndRank(userId);

        assertEquals("testUser", result.getUsername());
        assertEquals(100, result.getScore());
        assertEquals(1, result.getRank());
    }

    @Test
    void getUserScoreAndRank_UserNotFound_ReturnsDefault() {
        Long userId = 99L;
        when(quizResultRepository.findAllUserScoresOrdered()).thenReturn(Collections.emptyList());

        ScoreDTO result = quizResultService.getUserScoreAndRank(userId);

        assertEquals("Unbekannt", result.getUsername());
        assertEquals(0, result.getScore());
        assertEquals(-1, result.getRank());
    }

    @Test
    void getUserScoreAndRank_UserNotInList_ReturnsDefault() {
        Long userId = 2L;
        List<Object[]> orderedList = Collections.singletonList(new Object[]{1L, 100L});

        when(quizResultRepository.findAllUserScoresOrdered()).thenReturn(orderedList);

        ScoreDTO result = quizResultService.getUserScoreAndRank(userId);

        assertEquals("Unbekannt", result.getUsername());
        assertEquals(0, result.getScore());
        assertEquals(-1, result.getRank());
    }
}