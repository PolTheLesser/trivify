package rh.ptp.quizapp.service;

import org.json.JSONArray;
import org.json.JSONException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.model.QuizCategory;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.repository.QuizRepository;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.util.CreateAiRequest;

import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DailyQuizSchedulerServiceTest {

    @Mock
    private QuizRepository quizRepository;
    @Mock
    private QuizService quizService;
    @Mock
    private CreateAiRequest createAiRequest;
    @Mock
    private EmailService emailService;
    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DailyQuizSchedulerService schedulerService;

    private final String frontendUrl = "http://frontend";

    @BeforeEach
    void setup() {
        ReflectionTestUtils.setField(schedulerService, "createAiRequest", createAiRequest);
        ReflectionTestUtils.setField(schedulerService, "emailService", emailService);
        ReflectionTestUtils.setField(schedulerService, "userRepository", userRepository);
        ReflectionTestUtils.setField(schedulerService, "frontendUrl", frontendUrl);
    }

    @Test
    void generateDailyQuiz_WhenQuizExistsToday_DoesNothing() {
        LocalDate today = LocalDate.now();
        when(quizRepository.findByCategoriesAndDate(QuizCategory.DAILY_QUIZ, today))
                .thenReturn(Collections.singletonList(mock(Quiz.class)));

        schedulerService.generateDailyQuiz();

        verify(quizRepository, times(1)).findByCategoriesAndDate(QuizCategory.DAILY_QUIZ, today);
        verifyNoInteractions(createAiRequest, quizService, emailService);
    }

    @Test
    void generateDailyQuiz_WhenNoQuizToday_GeneratesQuizAndProcessesUsers() throws Exception {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);

        User userWithStreak = createUser(true, 3, yesterday.minusDays(1));
        userWithStreak.setEmail("streak-user@example.com");

        User userWithoutReminder = createUser(false, 2, yesterday);
        userWithoutReminder.setEmail("no-reminder@example.com");

        when(quizRepository.findByCategoriesAndDate(QuizCategory.DAILY_QUIZ, today))
                .thenReturn(Collections.emptyList());
        when(quizRepository.findByCategoriesAndDate(QuizCategory.DAILY_QUIZ, yesterday))
                .thenReturn(Collections.singletonList(mock(Quiz.class)));
        when(createAiRequest.fetchQuizFromAPI(anyString()))
                .thenReturn(new JSONArray());
        when(userRepository.findAll()).thenReturn(List.of(userWithStreak, userWithoutReminder));

        schedulerService.generateDailyQuiz();

        verify(quizService).updateDailyQuiz(any(), any());
        verify(userRepository).save(userWithStreak);
        assertEquals(0, userWithStreak.getDailyStreak());

        verify(emailService).sendEmail(
                eq("streak-user@example.com"),
                eq("Daily-Streak verloren 😔"),
                eq("daily-quiz-streak-lost"),
                anyMap()
        );

        verify(emailService, never()).sendEmail(
                eq("no-reminder@example.com"),
                any(),
                any(),
                any()
        );
    }

    @Test
    void generateDailyQuiz_WhenExceptionThrown_LogsError() throws Exception {
        when(quizRepository.findByCategoriesAndDate(any(), any()))
                .thenReturn(Collections.emptyList());
        when(createAiRequest.fetchQuizFromAPI(anyString()))
                .thenThrow(new JSONException("API error"));

        schedulerService.generateDailyQuiz();

        verify(quizService, never()).updateDailyQuiz(any(), any());
        verifyNoInteractions(emailService);
    }

    @Test
    void dailyQuizStreakReminder_UserMissedQuizWithStreak_SendsEmail() {
        User eligibleUser = createUser(true, 5, LocalDate.now().minusDays(1));
        when(userRepository.findByDailyQuizReminderIsTrue())
                .thenReturn(Collections.singletonList(eligibleUser));

        schedulerService.dailyQuizStreakReminder();

        verify(emailService).sendEmail(
                eq(eligibleUser.getEmail()),
                eq("Deine Streak ist in Gefahr! ⏳"),
                eq("daily-quiz-streak-reminder"),
                anyMap()
        );
    }

    @Test
    void dailyQuizStreakReminder_UserPlayedToday_NoEmail() {
        User playedTodayUser = createUser(true, 4, LocalDate.now());
        when(userRepository.findByDailyQuizReminderIsTrue())
                .thenReturn(Collections.singletonList(playedTodayUser));

        schedulerService.dailyQuizStreakReminder();

        verifyNoInteractions(emailService);
    }

    @Test
    void dailyQuizStreakReminder_UserNoStreak_NoEmail() {
        User noStreakUser = createUser(true, 0, LocalDate.now().minusDays(1));
        when(userRepository.findByDailyQuizReminderIsTrue())
                .thenReturn(Collections.singletonList(noStreakUser));

        schedulerService.dailyQuizStreakReminder();

        verifyNoInteractions(emailService);
    }

    private User createUser(boolean wantsReminder, int streak, LocalDate lastPlayed) {
        User user = new User();
        user.setEmail("test@example.com");
        user.setDailyQuizReminder(wantsReminder);
        user.setDailyStreak(streak);
        user.setLastDailyQuizPlayed(lastPlayed.atStartOfDay());
        return user;
    }
}