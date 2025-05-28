package rh.ptp.quizapp.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import rh.ptp.quizapp.dto.UserDTO;
import rh.ptp.quizapp.model.Quiz;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserRole;
import rh.ptp.quizapp.model.UserStatus;
import rh.ptp.quizapp.repository.UserRepository;
import rh.ptp.quizapp.service.AdminService;
import rh.ptp.quizapp.service.CleanupRepositoryService;
import rh.ptp.quizapp.service.QuizService;

import java.util.List;

import static rh.ptp.quizapp.mapper.UserMapper.*;

/**
 * REST-Controller für administrative Funktionen wie Benutzer- und Quizverwaltung.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {
    @Autowired
    private AdminService adminService;

    @Autowired
    private QuizService quizService;

    @Autowired
    private UserRepository userRepository;
    @Autowired
    private CleanupRepositoryService cleanupRepositoryService;

    /**
     * Gibt eine Liste aller Quizzes inklusive Bewertungen zurück.
     */
    @GetMapping("/quizzes")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<Quiz>> getQuizzesAdmin() {
        return ResponseEntity.ok(quizService.findAllWithRatings());
    }

    /**
     * Gibt eine Liste aller registrierten Benutzer im System zurück.
     */
    @GetMapping("/users")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<UserDTO>> getUsersAdmin() {
        List<User> users = userRepository.findAll();
        List<UserDTO> userDTOs = users.stream()
                .map(UserDTO::fromUser)
                .toList();
        return ResponseEntity.ok(userDTOs);
    }

    /**
     * Gibt alle verfügbaren Benutzerrollen zurück.
     */
    @GetMapping("/users/roles")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<String>> getUserRolesAdmin() {
        return ResponseEntity.ok(UserRole.getUserRoles());
    }

    /**
     * Gibt alle möglichen User-States zurück.
     */
    @GetMapping("/users/states")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<List<String>> getUserStatesAdmin() {
        return ResponseEntity.ok(UserStatus.getUserStates());
    }

    /**
     * Erstellt einen neuen Benutzer anhand der übergebenen Benutzerdaten.
     */
    @PostMapping("/users/create")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> createUserAdmin(@RequestBody UserDTO userToCreateDTO) {
        User userToCreate = userDTOToUser(userToCreateDTO);
        User createdUser = adminService.createUser(userToCreate);
        return ResponseEntity.ok(UserDTO.fromUser(createdUser));
    }

    /**
     * Aktualisiert einen bestehenden Benutzer mit neuen Daten.
     *
     * @param id Benutzer-ID
     */
    @PutMapping("/users/update/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<UserDTO> updateUserAdmin(@PathVariable Long id, @RequestBody UserDTO userToUpdateDTO) {
        User userToUpdate = userDTOToUser(userToUpdateDTO);
        User updatedUser = adminService.updateUser(id, userToUpdate);
        return ResponseEntity.ok(UserDTO.fromUser(updatedUser));
    }

    /**
     * Löscht einen Benutzer inklusive Vorbereitung durch das Cleanup-Service.
     *
     * @param id Benutzer-ID
     */
    @DeleteMapping("/users/delete/{id}")
    @PreAuthorize("hasAuthority('ADMIN')")
    public ResponseEntity<Void> deleteUserAdmin(@PathVariable Long id) {
        cleanupRepositoryService.prepareDelete(id);
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();

    }
}
