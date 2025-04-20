package rh.ptp.quizapp.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.quizapp.repository.AccountCleanupRepository;
import rh.ptp.quizapp.repository.UserRepository;

@Service
public class AccountCleanupService {

    private final AccountCleanupRepository accountCleanupRepository;
    private final UserRepository userRepository;

    public AccountCleanupService(AccountCleanupRepository accountCleanupRepository, UserRepository userRepository) {
        this.accountCleanupRepository = accountCleanupRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public void deleteUserAccount(long userId) {
        // 1. Lösche alle abhängigen Datensätze
        accountCleanupRepository.deleteAllQuizResultsByUser(userId);
        accountCleanupRepository.deleteAllQuizRatingsByUser(userId);
        accountCleanupRepository.deleteAllQuestionAnswersByUser(userId);
        accountCleanupRepository.deleteAllQuizQuestionsByUser(userId);
        accountCleanupRepository.deleteAllQuizzesByUser(userId);


        // 2. Lösche den Benutzer
        userRepository.deleteById(userId);
    }
}