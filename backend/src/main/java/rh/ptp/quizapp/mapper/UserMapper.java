package rh.ptp.quizapp.mapper;

import rh.ptp.quizapp.dto.UserDTO;
import rh.ptp.quizapp.model.User;

public class UserMapper {
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
