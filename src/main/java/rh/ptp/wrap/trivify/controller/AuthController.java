package rh.ptp.wrap.trivify.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import rh.ptp.wrap.trivify.exception.EmailAlreadyExistsException;
import rh.ptp.wrap.trivify.model.entity.User;
import rh.ptp.wrap.trivify.model.request.*;
import rh.ptp.wrap.trivify.service.AuthService;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        User registeredUser = authService.register(request);
        return ResponseEntity.ok().body(registeredUser);
    }

    @PostMapping("/verifyemail")
    public ResponseEntity<?> verifyEmail(@RequestBody VerifyEmailRequest request) {
        return authService.verifyEmail(request);
    }


    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgotpassword")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/resetpassword")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }
}
