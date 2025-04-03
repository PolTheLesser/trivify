package rh.ptp.wrap.trivify.controller;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rh.ptp.wrap.trivify.listener.OnPasswordResetCompleteEvent;
import rh.ptp.wrap.trivify.listener.OnRegistrationCompleteEvent;
import rh.ptp.wrap.trivify.listener.PasswordResetListener;
import rh.ptp.wrap.trivify.model.entity.User;
import rh.ptp.wrap.trivify.model.request.ForgotPasswordRequest;
import rh.ptp.wrap.trivify.model.request.LoginRequest;
import rh.ptp.wrap.trivify.model.request.RegisterRequest;
import rh.ptp.wrap.trivify.model.request.ResendVerificationTokenRequest;
import rh.ptp.wrap.trivify.service.AuthService;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AuthService authService;

    private final ApplicationEventPublisher applicationEventPublisher;

    public AuthController(AuthService authService, ApplicationEventPublisher applicationEventPublisher) {
        this.authService = authService;
        this.applicationEventPublisher = applicationEventPublisher;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        User registeredUser = authService.register(request);
        String appUrl = "http://localhost:8080/auth/register/confirm";
        applicationEventPublisher.publishEvent(new OnRegistrationCompleteEvent(registeredUser, appUrl));
        return ResponseEntity.ok().body(registeredUser);
    }

    @GetMapping("/register/confirm")
    public ResponseEntity<?> confirmRegistration(@RequestParam("token") String token) {
        User registeredUser = authService.confirmRegistration(token);
        return ResponseEntity.ok().body(registeredUser);
    }

    @PostMapping("/register/resendVerificationToken")
    public ResponseEntity<?> resendVerificationToken(@RequestBody @Valid ResendVerificationTokenRequest request) {
        User registeredUser = authService.getUserByToken(request.getToken());
        String appUrl = "http://localhost:8080/auth/register/confirm";
        applicationEventPublisher.publishEvent(new OnRegistrationCompleteEvent(registeredUser, appUrl));
        return ResponseEntity.ok().body(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody @Valid LoginRequest request) {

    }

    @PostMapping("/login/forgotPassword")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        User forgotPasswordUser = authService.getUserByEmail(request.getEmail());
        String appUrl = "http://localhost:8080/auth/login/changeForgotPassword";
        applicationEventPublisher.publishEvent(new OnPasswordResetCompleteEvent(forgotPasswordUser, appUrl));
        return ResponseEntity.ok().body(forgotPasswordUser);
    }

    @GetMapping("/login/changeForgotPassword")
    //TODO die Methode validiert das token; sofern validiert, so wird der user weitergeleitet um ein neues passwort zu erstellen

    @PostMapping("/login/savePassword")
    //TODO neues Passwort wird entgegengenommen und gespeichert



    /*@PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgotPassword")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/resetPassword")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }*/
}
