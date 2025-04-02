package rh.ptp.wrap.trivify.service;

import org.springframework.security.authentication.ott.InvalidOneTimeTokenException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rh.ptp.wrap.trivify.exception.EmailAlreadyExistsException;
import rh.ptp.wrap.trivify.exception.ExpiredTokenException;
import rh.ptp.wrap.trivify.exception.UsernameAlreadyExistsException;
import rh.ptp.wrap.trivify.model.entity.User;
import rh.ptp.wrap.trivify.model.entity.VerificationToken;
import rh.ptp.wrap.trivify.model.request.RegisterRequest;
import rh.ptp.wrap.trivify.repository.TokenRepository;
import rh.ptp.wrap.trivify.repository.UserRepository;

import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Calendar;

@Service
@Transactional
public class AuthService {


    private UserRepository userRepository;

    private TokenRepository tokenRepository;

    private PasswordEncoder passwordEncoder;

    AuthService(UserRepository userRepository, TokenRepository tokenRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.tokenRepository = tokenRepository;
        this.passwordEncoder = passwordEncoder;
    }


    public User register(RegisterRequest request) throws UsernameAlreadyExistsException, EmailAlreadyExistsException {
        if (emailExists(request.getEmail())) {
            throw new EmailAlreadyExistsException("A User with the given Email already exists.");
        }
        if (userExists(request.getUsername())) {
            throw new UsernameAlreadyExistsException("A User with the given Username already exists.");
        }

        User pendingUser = new User()
                .setUsername(request.getUsername())
                .setEmail(request.getEmail())
                .setPassword(passwordEncoder.encode(request.getPassword()))
                .setRoles(Arrays.asList("ROLE_USER"))
                .setCreatedAt(OffsetDateTime.now());
        return userRepository.save(pendingUser);
    }

    public User confirmRegistration(String token) {
        VerificationToken verificationToken = getVerificationToken(token);
        if (verificationToken == null) {
            throw new InvalidOneTimeTokenException("The provided token is invalid.");
        }
        User user = verificationToken.getQuizUser();
        Calendar cal = Calendar.getInstance();
        if (verificationToken.getExpiryDate().isBefore(OffsetDateTime.now())) {
            throw new ExpiredTokenException("The provided token is expired.");
        }
        user.setEnabled(true);
        return userRepository.save(user);
    }

    public void createVerificationToken(User user, String token) {
        VerificationToken myToken = new VerificationToken(token, user);
        tokenRepository.save(myToken);
    }
    public VerificationToken getVerificationToken(String VerificationToken) {
        return tokenRepository.findByToken(VerificationToken);
    }

    private boolean emailExists(String email) {
        return userRepository.findByEmail(email) != null;
    }
    private boolean userExists(String username) {
        return userRepository.findByUsername(username).isPresent();
    }

    /*public ResponseEntity<?> login(LoginRequest request) {
    }

    public ResponseEntity<?> forgotPassword(ForgotPasswordRequest request) {
    }

    public ResponseEntity<?> resetPassword(ResetPasswordRequest request) {
    }*/
}
