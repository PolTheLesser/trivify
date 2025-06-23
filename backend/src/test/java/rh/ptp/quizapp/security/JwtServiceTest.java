package rh.ptp.quizapp.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    private JwtService jwtService;
    private static final String PLAIN_SECRET = "myTestSecretKeyWhichIsLongEnoughForHS512Algorithm";
    private static final String BASE64_SECRET;
    private static final String USERNAME = "testUser";
    private static final String EMAIL = "user@test.com";
    private UserDetails userDetails;

    static {
        BASE64_SECRET = Base64.getEncoder().encodeToString(PLAIN_SECRET.getBytes(StandardCharsets.UTF_8));
    }

    @BeforeEach
    void setUp() throws Exception {
        jwtService = new JwtService();
        setSecretKey(BASE64_SECRET);

        userDetails = User.builder()
                .username(USERNAME)
                .password("password")
                .authorities(Collections.emptyList())
                .build();
    }

    private void setSecretKey(String secret) throws Exception {
        Field field = JwtService.class.getDeclaredField("SECRET_KEY");
        field.setAccessible(true);
        field.set(jwtService, secret);
    }

    private Key getTestKey() {
        return Keys.hmacShaKeyFor(PLAIN_SECRET.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void extractUsername_validToken_returnsUsername() {
        String token = jwtService.generateToken(userDetails);
        assertEquals(USERNAME, jwtService.extractUsername(token));
    }

    @Test
    void extractUsername_invalidToken_throwsException() {
        String invalidToken = "invalid.token.here";
        assertThrows(MalformedJwtException.class, () -> jwtService.extractUsername(invalidToken));
    }

    @Test
    void extractUsername_expiredToken_throwsException() {
        String expiredToken = Jwts.builder()
                .subject(USERNAME)
                .issuedAt(new Date(System.currentTimeMillis() - 10000))
                .expiration(new Date(System.currentTimeMillis() - 5000))
                .signWith(getTestKey())
                .compact();

        assertThrows(ExpiredJwtException.class, () -> jwtService.extractUsername(expiredToken));
    }

    @Test
    void generateToken_validUserDetails_containsUsername() {
        String token = jwtService.generateToken(userDetails);
        assertEquals(USERNAME, jwtService.extractUsername(token));
    }

    @Test
    void generateToken_defaultExpiration_correctDuration() {
        String token = jwtService.generateToken(userDetails);
        Date expiration = jwtService.extractClaim(token, Claims::getExpiration);
        long diff = expiration.getTime() - System.currentTimeMillis();

        assertTrue(diff >= 86395000 && diff <= 86405000);
    }

    @Test
    void generateToken_withExtraClaims_includesClaims() {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", "ADMIN");

        String token = jwtService.generateToken(claims, userDetails);
        String role = jwtService.extractClaim(token, c -> c.get("role", String.class));
        assertEquals("ADMIN", role);
    }

    @Test
    void isTokenValid_validToken_returnsTrue() {
        String token = jwtService.generateToken(userDetails);
        assertTrue(jwtService.isTokenValid(token, userDetails));
    }

    @Test
    void isTokenValid_expiredToken_throwsException() {
        String expiredToken = Jwts.builder()
                .subject(USERNAME)
                .issuedAt(new Date(System.currentTimeMillis() - 10000))
                .expiration(new Date(System.currentTimeMillis() - 5000))
                .signWith(getTestKey())
                .compact();

        assertThrows(ExpiredJwtException.class, () -> jwtService.isTokenValid(expiredToken, userDetails));

    }

    @Test
    void isTokenValid_wrongUser_returnsFalse() {
        String token = jwtService.generateToken(userDetails);
        UserDetails wrongUser = User.builder()
                .username("wrongUser")
                .password("pass")
                .authorities(Collections.emptyList())
                .build();

        assertFalse(jwtService.isTokenValid(token, wrongUser));
    }

    @Test
    void generatePasswordResetToken_containsUserEmail() {
        rh.ptp.quizapp.model.User user = new rh.ptp.quizapp.model.User();
        user.setEmail(EMAIL);

        String token = jwtService.generatePasswordResetToken(user);
        assertEquals(EMAIL, jwtService.extractUsername(token));
    }

    @Test
    void generatePasswordResetToken_hasOneHourExpiration() {
        rh.ptp.quizapp.model.User user = new rh.ptp.quizapp.model.User();
        user.setEmail(EMAIL);

        String token = jwtService.generatePasswordResetToken(user);
        Date expiration = jwtService.extractClaim(token, Claims::getExpiration);
        long diff = expiration.getTime() - System.currentTimeMillis();

        assertTrue(Math.abs(diff - 3600000) <= 5000);
    }
}