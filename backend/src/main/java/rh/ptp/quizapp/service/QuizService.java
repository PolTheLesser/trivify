package rh.ptp.quizapp.service;

import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import rh.ptp.quizapp.dto.*;
import rh.ptp.quizapp.model.*;
import rh.ptp.quizapp.repository.*;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class QuizService {
    private Logger log = LoggerFactory.getLogger(QuizService.class);
    @Autowired
    private QuizRepository quizRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private QuizResultRepository quizResultRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private QuizRatingRepository quizRatingRepository;

    @Autowired
    private QuizFavoriteRepository quizFavoriteRepository;

    @Autowired
    private UserService userService;

    public Quiz getQuizById(Long quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz nicht gefunden"));
    }

    public Quiz createQuiz(QuizDTO quizDTO, Long userId) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

        Quiz quiz = new Quiz();
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setCreator(creator);
        quiz.setPublic(true);
        quiz.setDailyQuiz(quizDTO.isDailyQuiz());
        quiz.setCreatedAt(LocalDateTime.now());
        quiz.setUpdatedAt(LocalDateTime.now());

        List<QuizQuestion> questions = quizDTO.getQuestions().stream()
                .map(q -> {
                    QuizQuestion question = new QuizQuestion();
                    question.setQuestion(q.getQuestion());
                    question.setAnswers(q.getAnswers());
                    question.setCorrectAnswer(q.getCorrectAnswer());
                    question.setDifficulty(q.getDifficulty());
                    question.setSource(quizDTO.getTitle());
                    question.setQuiz(quiz);
                    return question;
                })
                .collect(Collectors.toList());

        quiz.setQuestions(questions);
        return quizRepository.save(quiz);
    }

    public Quiz updateQuiz(Long quizId, QuizDTO quizDTO, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz nicht gefunden"));

        if (!quiz.getCreator().getId().equals(userId)) {
            throw new RuntimeException("Nur der Ersteller kann das Quiz bearbeiten");
        }

        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setPublic(quizDTO.isPublic());
        // Füge neue Fragen hinzu
        List<QuizQuestion> questions = quizDTO.getQuestions().stream()
                .map(q -> {
                    QuizQuestion question = new QuizQuestion();
                    question.setQuestion(q.getQuestion());
                    question.setAnswers(q.getAnswers());
                    question.setCorrectAnswer(q.getCorrectAnswer());
                    question.setDifficulty(q.getDifficulty());
                    question.setSource(q.getSource());
                    question.setSource(q.getSource());
                    question.setQuiz(quiz);
                    return question;
                })
                .toList();

        quiz.getQuestions().clear();
        quiz.getQuestions().addAll(questions);
        return quizRepository.save(quiz);
    }

    public void deleteQuiz(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz nicht gefunden"));

        if (!quiz.getCreator().getId().equals(userId)) {
            throw new RuntimeException("Nur der Ersteller kann das Quiz löschen");
        }

        quizRatingRepository.deleteByQuizId(quizId);   // 🧽
        quizResultRepository.deleteByQuizId(quizId);   // 🧽
        quizRepository.delete(quiz);
    }


    public List<Quiz> getUserQuizzes(Long userId) {
        return quizRepository.findByCreatorId(userId);
    }

    public QuizDTO getDailyQuiz() {
        LocalDate today = LocalDate.now();
        List<Quiz> dailyQuizzes = quizRepository.findByIsDailyQuizTrueAndDate(today);
        
        if (dailyQuizzes.isEmpty()) {
            throw new RuntimeException("Das tägliche Quiz wird jeden Tag um Mitternacht aktualisiert. Bitte versuchen Sie es später erneut.");
        }
        
        Quiz dailyQuiz = dailyQuizzes.get(0);
        if (dailyQuiz.getQuestions() == null || dailyQuiz.getQuestions().isEmpty()) {
            throw new RuntimeException("Keine Fragen im täglichen Quiz gefunden");
        }

        // Debug-Logging
        log.info("Daily Quiz gefunden: ID={}, Fragen={}, Datum={}", dailyQuiz.getId(), dailyQuiz.getQuestions().size(), dailyQuiz.getDate());

        QuizDTO quizDTO = new QuizDTO();
        quizDTO.setId(dailyQuiz.getId());
        quizDTO.setTitle(dailyQuiz.getTitle());
        quizDTO.setDescription(dailyQuiz.getDescription());
        quizDTO.setPublic(dailyQuiz.isPublic());
        quizDTO.setDailyQuiz(dailyQuiz.isDailyQuiz());
        quizDTO.setCreatorId(dailyQuiz.getCreator().getId());
        quizDTO.setCreatorUsername(dailyQuiz.getCreator().getName());

        // Konvertiere die Fragen in DTOs
        List<QuizQuestionDTO> questionDTOs = dailyQuiz.getQuestions().stream()
            .map(q -> {
                QuizQuestionDTO dto = new QuizQuestionDTO();
                dto.setId(q.getId());
                dto.setQuestion(q.getQuestion());
                dto.setAnswers(q.getAnswers());
                dto.setDifficulty(q.getDifficulty());
                dto.setSource(q.getSource());
                return dto;
            })
            .collect(Collectors.toList());

        quizDTO.setQuestions(questionDTOs);
        return quizDTO;
    }

    public void updateDailyQuiz(JSONArray questions) {
        try {
            Quiz dailyQuiz = new Quiz();
            dailyQuiz.setTitle("Tägliches Quiz vom " + LocalDate.now());
            dailyQuiz.setDescription("Teste dein Wissen mit unserem täglichen Quiz!");
            dailyQuiz.setDailyQuiz(true);
            dailyQuiz.setDate(LocalDate.now());
            dailyQuiz.setPublic(true);

            // Admin-Creator
            User adminUser = userRepository.findByEmail("quiz_rh@gmx.de")
                    .orElseGet(() -> {
                        User newAdmin = new User();
                        newAdmin.setName("Admin");
                        newAdmin.setEmail("quiz_rh@gmx.de");
                        newAdmin.setPassword(passwordEncoder.encode("admin123"));
                        newAdmin.setEmailVerified(true);
                        return userRepository.save(newAdmin);
                    });
            dailyQuiz.setCreator(adminUser);

            // Fragen umwandeln
            List<QuizQuestion> quizQuestions = new ArrayList<>();
            for (int i = 0; i < questions.length(); i++) {
                JSONObject questionObj = questions.getJSONObject(i);
                QuizQuestion question = new QuizQuestion();
                question.setQuestion(questionObj.getString("Frage"));

                JSONArray answers = questionObj.getJSONArray("Antworten");
                List<String> answerList = new ArrayList<>();
                for (int j = 0; j < answers.length(); j++) {
                    answerList.add(answers.getString(j));
                }
                question.setAnswers(answerList);

                question.setCorrectAnswer(questionObj.getString("RichtigeAntwort"));
                question.setDifficulty(1);
                question.setSource("Tägliches Quiz");
                question.setQuiz(dailyQuiz);

                quizQuestions.add(question);
            }

            dailyQuiz.setQuestions(quizQuestions);
            quizRepository.save(dailyQuiz);
            log.info("Tägliches Quiz erfolgreich gespeichert");

        } catch (Exception e) {
            log.error("Fehler beim Erstellen des täglichen Quiz: {}", e.getMessage());
            throw new RuntimeException("Fehler beim Erstellen des täglichen Quiz", e);
        }
    }


    public boolean hasCompletedDailyQuiz(Long userId) {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        return quizResultRepository.existsByUserIdAndQuizIsDailyQuizTrueAndPlayedAtAfter(userId, today);
    }

    public QuizQuestion findQuestionById(Long questionId) {
        log.debug("Suche Frage mit ID: {}", questionId);
        QuizQuestion frage = questionRepository.findByIdCustom(questionId);
        return frage;
    }

    public boolean checkAnswer(String userAnswer, String correctAnswer) {
        if(userAnswer == null || correctAnswer == null) {
            return false;
        }
        return userAnswer.trim().equalsIgnoreCase(correctAnswer.trim());
    }

    public QuizResultDTO checkAnswer(Long questionId, String userAnswer) {
        QuizQuestion question = findQuestionById(questionId);
        if (question == null) {
            throw new RuntimeException("Frage nicht gefunden");
        }

        boolean isCorrect = checkAnswer(userAnswer, question.getCorrectAnswer());
        
        QuizResultDTO result = new QuizResultDTO();
        result.setCorrect(isCorrect);
        result.setUserAnswer(userAnswer);
        result.setCorrectAnswer(question.getCorrectAnswer());
        result.setQuestion(question.getQuestion());
        result.setAnswers(question.getAnswers());
        
        return result;
    }

    public Integer rateQuiz(Long quizId, Long userId, int rating) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz nicht gefunden"));

        if (quiz.getCreator().getId().equals(userId)) {
            throw new RuntimeException("Du kannst dein eigenes Quiz nicht bewerten");
        }

        Optional<QuizRating> existing = quizRatingRepository.findByQuizIdAndUserId(quizId, userId);

        if (existing.isPresent()) {
            QuizRating r = existing.get();
            r.setRating(rating);
            quizRatingRepository.save(r);
        } else {
            QuizRating newRating = new QuizRating();
            newRating.setQuiz(quiz);
            newRating.setUserId(userRepository.findById(userId).get().getId());
            newRating.setRating(rating);
            newRating.setCreatedAt(LocalDateTime.now());
            quizRatingRepository.save(newRating);
        }
        return rating;
    }


    public boolean toggleFavorite(Long quizId, UserDetails userDetails) {
        User user = userService.getUserFromUserDetails(userDetails);
        Quiz quiz = getQuizById(quizId);
        
        Optional<QuizFavorite> existingFavorite = quizFavoriteRepository
                .findByUserIdAndQuizId(user.getId(), quizId);
        
        if (existingFavorite.isPresent()) {
            quizFavoriteRepository.delete(existingFavorite.get());
            return false;
        } else {
            QuizFavorite favorite = new QuizFavorite();
            favorite.setUser(user);
            favorite.setQuiz(quiz);
            quizFavoriteRepository.save(favorite);
            return true;
        }
    }

    public List<QuizHistoryDTO> getQuizHistory(UserDetails userDetails) {
        User user = userService.getUserFromUserDetails(userDetails);
        
        // Hole alle QuizResults für den User
        List<QuizResult> quizResults = quizResultRepository.findByUserId(user.getId());
        
        // Konvertiere die QuizResults in DTOs
        return quizResults.stream()
            .map(result -> {
                QuizHistoryDTO dto = new QuizHistoryDTO();
                dto.setId(result.getId());
                dto.setQuizId(result.getQuiz().getId());
                dto.setQuizTitle(result.getQuiz().getTitle());
                dto.setScore(result.getScore());
                dto.setMaxPossibleScore(result.getMaxPossibleScore());
                dto.setPlayedAt(result.getPlayedAt());
                // Optional: Füge weitere Felder hinzu, die Sie in der Historie anzeigen möchten
                return dto;
            })
            .collect(Collectors.toList());
    }

    /** Für GET /quizzes: hol alle Quizzes als QuizDTO mit Rating-Aggregaten */
    public List<Quiz> findAllWithRatings() {
        List<Quiz> quizzes = quizRepository.findAll();
        return quizzes.stream()
                .map(q -> {
                    Double avg   = quizRatingRepository.findAverageByQuizId(q.getId());
                    Long   cnt   = quizRatingRepository.countByQuizId(q.getId());
                    q.setAvgRating(avg != null ? avg : 0.0);
                    q.setRatingCount(cnt);
                    return q;
                })
                .collect(Collectors.toList());
    }
} 