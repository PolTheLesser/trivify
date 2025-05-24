package rh.ptp.quizapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserRole;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.service.AdminService;
import rh.ptp.quizapp.service.QuizService;
import rh.ptp.quizapp.service.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private AdminService adminService;

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

    @GetMapping("/users/roles")
    public ResponseEntity<List<String>> getUserRolesAdmin(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(UserRole.getUserRoles());
    }

    @GetMapping("/users/states")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<String>> getUserStatesAdmin(@AuthenticationPrincipal User user) {
            return ResponseEntity.ok(UserStatus.getUserStates());
    }


    @PostMapping("/users/create")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUserAdmin(@RequestBody User userToCreate, @AuthenticationPrincipal User user) {
            return ResponseEntity.ok(adminService.createUser(userToCreate));
    }

    @PutMapping("/users/update/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> updateUserAdmin(@PathVariable Long id, @RequestBody User userToUpdate, @AuthenticationPrincipal User user) {
            return ResponseEntity.ok(adminService.updateUser(id, userToUpdate));

    }

    @DeleteMapping("/users/delete/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUserAdmin(@PathVariable Long id, @AuthenticationPrincipal User user) {
            adminService.deleteUser(id);
            return ResponseEntity.ok().build();

    }
}
