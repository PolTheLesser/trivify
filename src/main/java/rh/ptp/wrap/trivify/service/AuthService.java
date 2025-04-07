package rh.ptp.wrap.trivify.service;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.ott.InvalidOneTimeTokenException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.wrap.trivify.exception.*;
import rh.ptp.wrap.trivify.model.entity.EmailAuthenticationToken;
import rh.ptp.wrap.trivify.model.entity.User;
import rh.ptp.wrap.trivify.model.request.LoginRequest;
import rh.ptp.wrap.trivify.model.request.RegisterRequest;
import rh.ptp.wrap.trivify.model.request.ResetPasswordRequest;
import rh.ptp.wrap.trivify.repository.TokenRepository;
import rh.ptp.wrap.trivify.repository.UserRepository;

import java.time.OffsetDateTime;
import java.util.Arrays;

@Service
@Transactional
public class AuthService {

    public AuthService(UserRepository userRepository, TokenRepository tokenRepository, PasswordEncoder passwordEncoder, AuthenticationManager authenticationManager, JwtService jwtService) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    private UserRepository userRepository;

    private TokenRepository tokenRepository;

    private PasswordEncoder passwordEncoder;

    private AuthenticationManager authenticationManager;

    private JwtService jwtService;


    public User register(RegisterRequest request) throws UsernameAlreadyExistsException, EmailAlreadyExistsException {
        if (emailExists(request.getEmail())) {
            throw new EmailAlreadyExistsException("A User with the given Email already exists.");
        }
        if (userExistsByUsername(request.getUsername())) {
            throw new UsernameAlreadyExistsException("A User with the given Username already exists.");
        }

        User pendingUser = new User()
                .setUsername(request.getUsername())
                .setEmail(request.getEmail())
                .setPassword(passwordEncoder.encode(request.getPassword()))
                .setRoles(Arrays.asList("ROLE_USER"))// TODO evtl rolle für not enabled
                .setCreatedAt(OffsetDateTime.now());
        return userRepository.save(pendingUser);
    }

    public User confirmRegistration(String token) {
        EmailAuthenticationToken emailAuthenticationToken = getEmailAuthenticationToken(token);
        if (emailAuthenticationToken == null) {
            throw new InvalidOneTimeTokenException("The provided token is invalid.");
        }
        User user = emailAuthenticationToken.getQuizUser();
        if (emailAuthenticationToken.getExpiryDate().isBefore(OffsetDateTime.now())) {
            throw new ExpiredTokenException("The provided token is expired.");
        }
        user.setEnabled(true);
        return userRepository.save(user);
    }

    public String login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
            if (!authentication.isAuthenticated()) {
                throw new AuthenticationException("User could not be authenticated.");
            }
            String token = jwtService.generateToken(request.getUsername());
            return token;
        } catch (Exception e) {
            throw new InvalidCredentialsException("Invalid credentials.");
        }
    }

    public void createAuthenticationToken(User user, String token) {
        EmailAuthenticationToken existingToken = tokenRepository.findByQuizUser(user);
        System.out.println("" + tokenRepository.findByQuizUser(user));
        if (existingToken != null) {
            tokenRepository.delete(existingToken);
            System.out.println("" + tokenRepository.findByQuizUser(user));
        }
        EmailAuthenticationToken myToken = new EmailAuthenticationToken(token, user);
        tokenRepository.save(myToken);
        System.out.println("" + tokenRepository.findByQuizUser(user));
    }

    public EmailAuthenticationToken getEmailAuthenticationToken(String token) {
        EmailAuthenticationToken emailAuthenticationToken = tokenRepository.findByToken(token);
        if (emailAuthenticationToken == null) {
            throw new InvalidOneTimeTokenException("The provided token is invalid.");
        }
        return emailAuthenticationToken;
    }

    public User getUserByToken(String token) {
        EmailAuthenticationToken emailAuthenticationToken = getEmailAuthenticationToken(token);
        return emailAuthenticationToken.getQuizUser();
    }

    public void saveNewPassword(ResetPasswordRequest request, String token) {

        User user = getUserByResetToken(token);
        if (user == null) {
            throw new IllegalArgumentException("Invalid or expired reset token.");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());

        user.setPassword(encodedPassword);

        userRepository.save(user);
    }

    private boolean emailExists(String email) {
        return userRepository.findByEmail(email) != null;
    }
    private boolean userExistsByUsername(String username) {
        return userRepository.findByUsername(username) != null;
    }

    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public boolean userExistsByEmail(String email) {
        return userRepository.findByEmail(email) != null;
    }

    private User getUserByResetToken(String token) {
        EmailAuthenticationToken resetToken = tokenRepository.findByToken(token);
        return resetToken != null ? resetToken.getQuizUser() : null;
    }
}
