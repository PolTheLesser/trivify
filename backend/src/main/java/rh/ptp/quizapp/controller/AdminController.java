package rh.ptp.quizapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.service.QuizService;
import rh.ptp.quizapp.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private UserService userService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/quizzes")
    public ResponseEntity<List<Quiz>> getQuizzesAdmin() {
        return ResponseEntity.ok(quizService.findAllWithRatings());
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsersAdmin() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping("/users/create")
    public ResponseEntity<User> createUserAdmin(User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @PutMapping("/users/update/{id}")
    public ResponseEntity<User> updateUserAdmin(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @DeleteMapping("/users/delete/{id}")
    public ResponseEntity<Void> deleteUserAdmin(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }
}
