package rh.ptp.wrap.trivify.controller;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rh.ptp.wrap.trivify.listener.OnRegistrationCompleteEvent;
import rh.ptp.wrap.trivify.model.entity.User;
import rh.ptp.wrap.trivify.model.request.RegisterRequest;
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

    @GetMapping("/register/resendVerificationToken")
    public ResponseEntity<?> resendVerificationToken(@RequestParam("token") String token) {
        User registeredUser = authService.getUserByToken(token);
        String appUrl = "http://localhost:8080/auth/register/confirm";
        applicationEventPublisher.publishEvent(new OnRegistrationCompleteEvent(registeredUser, appUrl));
        return ResponseEntity.ok().body(registeredUser);
    }

    //TODO change and reset password

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
