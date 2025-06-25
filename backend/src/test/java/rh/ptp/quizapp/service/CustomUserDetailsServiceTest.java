package rh.ptp.quizapp.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import rh.ptp.quizapp.model.User;
import rh.ptp.quizapp.repository.UserRepository;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.Mockito.when;

class CustomUserDetailsServiceTest {

    private UserRepository userRepository;
    private CustomUserDetailsService customUserDetailsService;

    @BeforeEach
    void setUp() {
        userRepository = Mockito.mock(UserRepository.class);
        customUserDetailsService = new CustomUserDetailsService(userRepository);
    }
    @Test
    void loadUserByUsername_returnsUserDetails_whenUserExists() {
        String email = "test@example.com";
        User user = new User();
        user.setEmail(email);
        user.setPassword("encodedPassword");
        when(userRepository.findByEmail(email)).thenReturn(Optional.of(user));

        UserDetails result = customUserDetailsService.loadUserByUsername(email);

        assertEquals(email, result.getUsername());
        assertEquals("encodedPassword", result.getPassword());
        assertEquals(1, result.getAuthorities().size());
    }
    @Test
    void loadUserByUsername_throwsException_whenUserNotFound() {
        String email = "notfound@example.com";
        when(userRepository.findByEmail(email)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            customUserDetailsService.loadUserByUsername(email);
        });
    }

}
