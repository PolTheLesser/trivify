package rh.ptp.wrap.trivify.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import rh.ptp.wrap.trivify.exception.EmailAlreadyExistsException;
import rh.ptp.wrap.trivify.model.dto.UserDto;
import rh.ptp.wrap.trivify.model.entity.User;
import rh.ptp.wrap.trivify.model.request.*;
import rh.ptp.wrap.trivify.repository.UserRepository;

@Service
public class AuthService {

    private final UserRepository userRepository;

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }


    public User register(RegisterRequest request) throws Exception{
        if (emailExists(request.getEmail())) {
            throw new Exception();
        }
        User pendingUser = new User()
                .setUsername(request.getUsername())
                .set
        return userRepository.save(pendingUser);
    }

    public ResponseEntity<?> verifyEmail(VerifyEmailRequest request) {
    }

    public ResponseEntity<?> login(LoginRequest request) {
    }

    public ResponseEntity<?> forgotPassword(ForgotPasswordRequest request) {
    }

    public ResponseEntity<?> resetPassword(ResetPasswordRequest request) {
    }

    private boolean emailExists(String email) {
        return userRepository.findByEmail(email) != null;
    }
}
