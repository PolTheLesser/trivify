package rh.ptp.quizapp.mapper;

import rh.ptp.quizapp.dto.UserDTO;
import rh.ptp.quizapp.model.User;

/**
 * Diese Klasse stellt Methoden zur Umwandlung zwischen {@link User} und {@link UserDTO} bereit.
 */
public class UserMapper {

    /**
     * Konvertiert ein {@link User} Entity in ein {@link UserDTO}.
     *
     * @param user Das User-Entity
     * @return Das zugehörige UserDTO oder {@code null}, wenn das Eingabeobjekt {@code null} ist
     */
    public static UserDTO userToUserDTO(User user) {
        if (user == null) {
            return null;
        }
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setName(user.getName());
        userDTO.setEmail(user.getEmail());
        userDTO.setRole(user.getRole());
        userDTO.setUserStatus(user.getUserStatus());
        userDTO.setDailyQuizReminder(user.isDailyQuizReminder());
        userDTO.setDailyStreak(user.getDailyStreak());
        userDTO.setUpdatedAt(user.getUpdatedAt());
        userDTO.setCreatedAt(user.getCreatedAt());
        return userDTO;
    }

    /**
     * Konvertiert ein {@link UserDTO} in ein {@link User} Entity.
     *
     * @param userDTO Das UserDTO
     * @return Das zugehörige User-Entity oder {@code null}, wenn das Eingabeobjekt {@code null} ist
     */
    public static User userDTOToUser(UserDTO userDTO) {
        if (userDTO == null) {
            return null;
        }
        User user = new User();
        user.setId(userDTO.getId());
        user.setName(userDTO.getName());
        user.setEmail(userDTO.getEmail());
        user.setRole(userDTO.getRole());
        user.setUserStatus(userDTO.getUserStatus());
        user.setDailyQuizReminder(userDTO.isDailyQuizReminder());
        user.setDailyStreak(userDTO.getDailyStreak());
        user.setUpdatedAt(userDTO.getUpdatedAt());
        user.setCreatedAt(userDTO.getCreatedAt());
        return user;
    }
}
