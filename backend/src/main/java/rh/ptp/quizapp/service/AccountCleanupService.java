package rh.ptp.quizapp.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.repository.UserRepository;

@Service
public class AccountCleanupService {

    private final CleanupRepositoryService cleanupRepositoryService;
    private final UserRepository userRepository;

    public AccountCleanupService(CleanupRepositoryService cleanupRepositoryService, UserRepository userRepository) {
        this.cleanupRepositoryService = cleanupRepositoryService;
        this.userRepository = userRepository;
    }

    @Transactional
    public void deleteUserAccount(long userId) {
        // 1. Lösche alle abhängigen Datensätze
        cleanupRepositoryService.deleteAllQuizResultsByUser(userId);
        cleanupRepositoryService.deleteAllQuizRatingsByUser(userId);
        cleanupRepositoryService.deleteAllQuestionAnswersByUser(userId);
        cleanupRepositoryService.deleteAllQuizQuestionsByUser(userId);
        cleanupRepositoryService.deleteAllQuizzesByUser(userId);


        // 2. Lösche den Benutzer
        userRepository.deleteById(userId);
    }
}