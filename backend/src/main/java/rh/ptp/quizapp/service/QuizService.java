package rh.ptp.quizapp.service;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.json.JSONArray;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import rh.ptp.quizapp.dto.*;
import rh.ptp.quizapp.model.*;
import rh.ptp.quizapp.repository.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Service-Klasse zur Verwaltung von Quiz-bezogenen Operationen,
 * inklusive Erstellen, Bearbeiten, Löschen, Bewerten und Abrufen von Quizzes.
 */
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
    private QuizQuestionRepository quizQuestionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private QuizRatingRepository quizRatingRepository;

    @Autowired
    private QuizFavoriteRepository quizFavoriteRepository;

    @Autowired
    private UserService userService;

    @Value("${spring.mail.username}")
    private String mailUser;

    @Value("${admin.password}")
    private String adminpassword;

    /**
     * Holt ein Quiz anhand seiner ID.
     *
     * @param quizId Die ID des Quizzes.
     * @return Das Quiz-Objekt.
     */
    public Quiz getQuizById(Long quizId) {
        return quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz nicht gefunden"));
    }

    /**
     * Erstellt ein neues Quiz basierend auf den übergebenen Daten.
     *
     * @param quizDTO Die Daten für das neue Quiz.
     * @param userId  ID des Erstellers.
     * @return Das erstellte Quiz-Objekt.
     */
    public Quiz createQuiz(QuizDTO quizDTO, Long userId) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Benutzer nicht gefunden"));

        Quiz quiz = new Quiz();
        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        quiz.setCategories(quizDTO.getCategories());
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
                    question.setQuestionType(q.getQuestionType());
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

    /**
     * Aktualisiert ein bestehendes Quiz.
     *
     * @param quizId  Die ID des zu aktualisierenden Quizzes.
     * @param quizDTO Neue Daten.
     * @param userId  ID des Bearbeitenden.
     * @return Das aktualisierte Quiz.
     */
    public Quiz updateQuiz(Long quizId, QuizDTO quizDTO, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz nicht gefunden"));

        if (!quiz.getCreator().getId().equals(userId) && !isAdmin(userId)) {
            throw new RuntimeException("Nur der Ersteller kann das Quiz bearbeiten");
        }

        quiz.setTitle(quizDTO.getTitle());
        quiz.setDescription(quizDTO.getDescription());
        List<QuizCategory> newCategories = quizDTO.getCategories();
        if (quiz.getCategories().contains(QuizCategory.DAILY_QUIZ)){
            newCategories.add(QuizCategory.DAILY_QUIZ);
        }
        quiz.setCategories(newCategories);
        quiz.setPublic(quizDTO.isPublic());
        List<QuizQuestion> questions = quizDTO.getQuestions().stream()
                .map(q -> {
                    QuizQuestion question = new QuizQuestion();
                    question.setQuestion(q.getQuestion());
                    question.setAnswers(q.getAnswers());
                    question.setCorrectAnswer(q.getCorrectAnswer());
                    question.setQuestionType(q.getQuestionType());
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

    /**
     * Löscht ein Quiz samt aller zugehörigen Einträge (Bewertungen, Favoriten, Ergebnisse).
     *
     * @param quizId Die ID des zu löschenden Quizzes.
     * @param userId Die ID des anfordernden Benutzers.
     */
    @Transactional
    public void deleteQuiz(Long quizId, Long userId) {
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new RuntimeException("Quiz nicht gefunden"));

        if (!quiz.getCreator().getId().equals(userId) && !isAdmin(userId)) {
            throw new RuntimeException("Nur der Ersteller kann das Quiz löschen");
        }

        quizFavoriteRepository.deleteByQuizId(quizId);
        quizRatingRepository.deleteByQuizId(quizId);
        quizResultRepository.deleteByQuizId(quizId);
        quizRepository.delete(quiz);
    }

    /**
     * Gibt alle vom Benutzer erstellten Quizzes zurück.
     *
     * @param userId Die Benutzer-ID.
     * @return Liste der Quizzes.
     */
    public List<Quiz> getUserQuizzes(Long userId) {
        return quizRepository.findByCreatorId(userId);
    }

    /**
     * Holt das tägliche Quiz als DTO.
     *
     * @return Ein QuizDTO für das tägliche Quiz.
     */
    public QuizDTO getDailyQuiz() {
        LocalDate today = LocalDate.now();
        List<Quiz> dailyQuizzes = quizRepository.findByCategoriesAndDate(QuizCategory.DAILY_QUIZ, today);

        if (dailyQuizzes.isEmpty()) {
            throw new RuntimeException("Das tägliche Quiz wird jeden Tag um Mitternacht aktualisiert. Bitte versuchen Sie es später erneut.");
        }

        Quiz dailyQuiz = dailyQuizzes.get(0);
        if (dailyQuiz.getQuestions() == null || dailyQuiz.getQuestions().isEmpty()) {
            throw new RuntimeException("Keine Fragen im täglichen Quiz gefunden");
        }

        log.info("Daily Quiz gefunden: ID={}, Fragen={}, Datum={}", dailyQuiz.getId(), dailyQuiz.getQuestions().size(), dailyQuiz.getDate());

        QuizDTO quizDTO = new QuizDTO();
        quizDTO.setId(dailyQuiz.getId());
        quizDTO.setTitle(dailyQuiz.getTitle());
        quizDTO.setDescription(dailyQuiz.getDescription());
        quizDTO.setPublic(dailyQuiz.isPublic());
        quizDTO.setDailyQuiz(dailyQuiz.isDailyQuiz());
        quizDTO.setCreatorId(dailyQuiz.getCreator().getId());
        quizDTO.setCreatorUsername(dailyQuiz.getCreator().getName());

        List<QuizQuestionDTO> questionDTOs = dailyQuiz.getQuestions().stream()
                .map(q -> {
                    QuizQuestionDTO dto = new QuizQuestionDTO();
                    dto.setId(q.getId());
                    dto.setQuestion(q.getQuestion());
                    dto.setAnswers(q.getAnswers());
                    dto.setCorrectAnswer("");
                    dto.setDifficulty(q.getDifficulty());
                    dto.setSource(q.getSource());
                    dto.setQuestionType(q.getQuestionType());
                    return dto;
                })
                .collect(Collectors.toList());

        quizDTO.setQuestions(questionDTOs);
        return quizDTO;
    }

    /**
     * Erstellt oder ersetzt das tägliche Quiz.
     *
     * @param questions JSON-Fragenarray.
     * @param category  Kategorie des täglichen Quizzes.
     */
    public void updateDailyQuiz(JSONArray questions, QuizCategory category) {
        try {
            Quiz dailyQuiz = new Quiz();
            dailyQuiz.setTitle("Tägliches Quiz vom " + LocalDate.now() + ", Kategorie: " + category.getDisplayName());
            dailyQuiz.setDescription("Teste dein Wissen mit unserem täglichen Quiz!");
            dailyQuiz.setCategories(List.of(QuizCategory.DAILY_QUIZ, category));
            dailyQuiz.setDate(LocalDate.now());
            dailyQuiz.setPublic(true);

            // Admin-Creator
            User adminUser = userRepository.findByEmail(mailUser)
                    .orElseGet(() -> {
                        User newAdmin = new User();
                        newAdmin.setName("Admin");
                        newAdmin.setEmail(mailUser);
                        newAdmin.setRole(UserRole.ROLE_ADMIN);
                        newAdmin.setPassword(passwordEncoder.encode(adminpassword));
                        newAdmin.setUserStatus(UserStatus.ACTIVE);
                        return userRepository.save(newAdmin);
                    });
            dailyQuiz.setCreator(adminUser);

            // Fragen umwandeln
            List<QuizQuestion> quizQuestions = new ArrayList<>();
            for (int i = 0; i < questions.length(); i++) {
                JSONObject questionObj = questions.getJSONObject(i);
                QuizQuestion question = new QuizQuestion();
                question.setQuestion(questionObj.getString("Frage"));
                question.setQuestionType(QuestionType.MULTIPLE_CHOICE);
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

    /**
     * Prüft, ob ein Benutzer das heutige tägliche Quiz bereits absolviert hat.
     *
     * @param userId Benutzer-ID.
     * @return true, wenn bereits gespielt, sonst false.
     */
    public boolean hasCompletedDailyQuiz(Long userId) {
        LocalDateTime today = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0).withNano(0);
        return quizResultRepository.existsByUserIdAndQuizCategoriesAndPlayedAtAfter(userId, QuizCategory.DAILY_QUIZ, today);
    }

    /**
     * Findet eine Frage anhand ihrer ID.
     *
     * @param questionId ID der Frage.
     * @return Die Quiz-Frage.
     */
    public QuizQuestion findQuestionById(Long questionId) {
        log.debug("Suche Frage mit ID: {}", questionId);
        return quizQuestionRepository.findById(questionId)
               .orElseThrow(() -> new EntityNotFoundException("QuizQuestion not found"));
    }

    /**
     * Überprüft eine Antwort auf eine Quizfrage.
     *
     * @param userAnswer    Antwort des Benutzers.
     * @param correctAnswer Richtige Antwort.
     * @return true, wenn die Antwort korrekt ist, sonst false.
     */
    public boolean checkAnswer(String userAnswer, String correctAnswer) {
        if (userAnswer == null || correctAnswer == null) {
            return false;
        }
        return userAnswer.trim().equalsIgnoreCase(correctAnswer.trim());
    }

    /**
     * Bewertet eine Antwort auf eine bestimmte Frage.
     *
     * @param questionId ID der Frage.
     * @param userAnswer Antwort des Benutzers.
     * @return Ein Ergebnis-Datentransferobjekt.
     */
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

    /**
     * Bewertet ein Quiz durch den Benutzer.
     *
     * @param quizId ID des Quizzes.
     * @param userId ID des Benutzers, der bewertet.
     * @param rating Bewertung (1-5).
     * @return Die Bewertung des Quizzes.
     */
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

    /**
     * Markiert oder entfernt ein Quiz aus den Favoriten des Benutzers.
     *
     * @param quizId      ID des Quizzes.
     * @param userDetails Benutzer-Details.
     * @return true, wenn neu hinzugefügt, false, wenn entfernt.
     */
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

    /**
     * Holt die Quiz-Historie eines Benutzers.
     *
     * @param userDetails Authentifizierungsdetails des Benutzers.
     * @return Liste von QuizHistoryDTOs, die die Historie des Benutzers enthalten.
     */
    public List<QuizHistoryDTO> getQuizHistory(UserDetails userDetails) {
        User user = userService.getUserFromUserDetails(userDetails);

        List<QuizResult> quizResults = quizResultRepository.findByUserId(user.getId());

        return quizResults.stream()
                .map(result -> {
                    QuizHistoryDTO dto = new QuizHistoryDTO();
                    dto.setId(result.getId());
                    dto.setQuizId(result.getQuiz().getId());
                    dto.setQuizTitle(result.getQuiz().getTitle());
                    dto.setScore(result.getScore());
                    dto.setMaxPossibleScore(result.getMaxPossibleScore());
                    dto.setPlayedAt(result.getPlayedAt());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    /**
     * Holt alle Quizzes mit ihren Bewertungen.
     *
     * @return Liste von Quizzes mit Durchschnittsbewertung und Anzahl der Bewertungen.
     */
    public List<Quiz> findAllWithRatings() {
        List<Quiz> quizzes = quizRepository.findAll();
        return quizzes.stream()
                .map(q -> {
                    Double avg = quizRatingRepository.findAverageByQuizId(q.getId());
                    Long cnt = quizRatingRepository.countByQuizId(q.getId());
                    q.setAvgRating(avg != null ? avg : 0.0);
                    q.setRatingCount(cnt);
                    return q;
                })
                .collect(Collectors.toList());
    }

    /**
     * Gibt alle verfügbaren Quiz-Kategorien (als Text) zurück.
     *
     * @return Liste von Kategorienamen.
     */
    public List<String> getCategoryValues() {
        List<String> values = new ArrayList<>();
        for (QuizCategory category : QuizCategory.values()) {
            values.add(category.getDisplayName());
        }
        return values;
    }

    /**
     * Validiert die Eingabedaten für ein QuizDTO.
     *
     * @param quizDTO Das zu validierende QuizDTO.
     */
    public void validateQuizDTO(QuizDTO quizDTO) {
        if (quizDTO.getTitle() == null || quizDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Titel darf nicht leer sein");
        }
        if (quizDTO.getCategories() == null || quizDTO.getCategories().size() > 3) {
            throw new IllegalArgumentException("Es min. 1 und maximal 3 Kategorien ausgewählt werden");
        }

        for (int i = 0; i < quizDTO.getQuestions().size(); i++) {
            QuizQuestionDTO q = quizDTO.getQuestions().get(i);

            if (q.getQuestion() == null || q.getQuestion().trim().isEmpty()) {
                throw new IllegalArgumentException("Frage " + (i + 1) + " ist leer");
            }

            if (q.getCorrectAnswer() == null || q.getCorrectAnswer().trim().isEmpty()) {
                throw new IllegalArgumentException("Richtige Antwort fehlt bei Frage " + (i + 1));
            }

            if (q.getQuestionType() != QuestionType.TEXT_INPUT) {

                if (q.getAnswers() == null || q.getAnswers().size() < 2) {
                    throw new IllegalArgumentException("Es müssen mindestens 2 Antwortmöglichkeiten bei Frage " + (i + 1) + " angegeben werden");
                }

                if (q.getAnswers().size() > 4) {
                    throw new IllegalArgumentException("Es dürfen maximal 4 Antwortmöglichkeiten bei Frage " + (i + 1) + " angegeben werden");
                }

                if (q.getAnswers() == null || q.getAnswers().isEmpty() || q.getAnswers().stream().anyMatch(a -> a == null || a.trim().isEmpty())) {
                    throw new IllegalArgumentException("Alle Antwortmöglichkeiten müssen bei Frage " + (i + 1) + " ausgefüllt sein");
                }

                if (!q.getAnswers().contains(q.getCorrectAnswer())) {
                    throw new IllegalArgumentException("Richtige Antwort ist bei Frage " + (i + 1) + " nicht unter den gegebenen Antworten");
                }

                long distinctCount = q.getAnswers().stream().distinct().count();
                if (distinctCount != q.getAnswers().size()) {
                    throw new IllegalArgumentException("Antwortmöglichkeiten dürfen nicht identisch sein bei Frage " + (i + 1));
                }
            }
        }
    }

    /**
     * Überprüft, ob der Benutzer ein Administrator ist.
     *
     * @param userId ID des Benutzers.
     * @return true, wenn der Benutzer ein Administrator ist, sonst false.
     */
    private boolean isAdmin(Long userId) {
        return userRepository.findById(userId)
                .map(u -> u.getRole() == UserRole.ROLE_ADMIN)
                .orElse(false);
    }
}