package rh.ptp.quizapp.mapper;

import org.junit.jupiter.api.Test;
import rh.ptp.quizapp.dto.UserDTO;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.model.UserRole;
import rh.ptp.quizapp.model.UserStatus;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

public class UserMapperTest {

    @Test
    void userToUserDTO_WithValidUser_ReturnsUserDTO() {
        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setRole(UserRole.ROLE_USER);
        user.setUserStatus(UserStatus.ACTIVE);
        user.setDailyQuizReminder(true);
        user.setDailyStreak(5);

        UserDTO result = UserMapper.userToUserDTO(user);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test User", result.getName());
        assertEquals("test@example.com", result.getEmail());
        assertEquals(UserRole.ROLE_USER, result.getRole());
        assertEquals(UserStatus.ACTIVE, result.getUserStatus());
        assertTrue(result.isDailyQuizReminder());
        assertEquals(5, result.getDailyStreak());
    }

    @Test
    void userToUserDTO_WithNullUser_ReturnsNull() {
        UserDTO result = UserMapper.userToUserDTO(null);

        assertNull(result);
    }

    @Test
    void userToUserDTO_WithAllFieldsPopulated_MapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);
        
        User user = new User();
        user.setId(1L);
        user.setName("Test User");
        user.setEmail("test@example.com");
        user.setRole(UserRole.ROLE_ADMIN);
        user.setUserStatus(UserStatus.ACTIVE);
        user.setDailyQuizReminder(true);
        user.setDailyStreak(10);
        user.setCreatedAt(yesterday);
        user.setUpdatedAt(now);

        UserDTO result = UserMapper.userToUserDTO(user);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test User", result.getName());
        assertEquals("test@example.com", result.getEmail());
        assertEquals(UserRole.ROLE_ADMIN, result.getRole());
        assertEquals(UserStatus.ACTIVE, result.getUserStatus());
        assertTrue(result.isDailyQuizReminder());
        assertEquals(10, result.getDailyStreak());
        assertEquals(yesterday, result.getCreatedAt());
        assertEquals(now, result.getUpdatedAt());
    }

    @Test
    void userDTOToUser_WithValidUserDTO_ReturnsUser() {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(1L);
        userDTO.setName("Test User");
        userDTO.setEmail("test@example.com");
        userDTO.setRole(UserRole.ROLE_USER);
        userDTO.setUserStatus(UserStatus.ACTIVE);
        userDTO.setDailyQuizReminder(true);
        userDTO.setDailyStreak(5);

        User result = UserMapper.userDTOToUser(userDTO);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test User", result.getName());
        assertEquals("test@example.com", result.getEmail());
        assertEquals(UserRole.ROLE_USER, result.getRole());
        assertEquals(UserStatus.ACTIVE, result.getUserStatus());
        assertTrue(result.isDailyQuizReminder());
        assertEquals(5, result.getDailyStreak());
    }

    @Test
    void userDTOToUser_WithNullUserDTO_ReturnsNull() {
        User result = UserMapper.userDTOToUser(null);

        assertNull(result);
    }

    @Test
    void userDTOToUser_WithAllFieldsPopulated_MapsAllFields() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime yesterday = now.minusDays(1);
        
        UserDTO userDTO = new UserDTO();
        userDTO.setId(1L);
        userDTO.setName("Test User");
        userDTO.setEmail("test@example.com");
        userDTO.setRole(UserRole.ROLE_ADMIN);
        userDTO.setUserStatus(UserStatus.ACTIVE);
        userDTO.setDailyQuizReminder(true);
        userDTO.setDailyStreak(10);
        userDTO.setCreatedAt(yesterday);
        userDTO.setUpdatedAt(now);

        User result = UserMapper.userDTOToUser(userDTO);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Test User", result.getName());
        assertEquals("test@example.com", result.getEmail());
        assertEquals(UserRole.ROLE_ADMIN, result.getRole());
        assertEquals(UserStatus.ACTIVE, result.getUserStatus());
        assertTrue(result.isDailyQuizReminder());
        assertEquals(10, result.getDailyStreak());
        assertEquals(yesterday, result.getCreatedAt());
        assertEquals(now, result.getUpdatedAt());
    }
}