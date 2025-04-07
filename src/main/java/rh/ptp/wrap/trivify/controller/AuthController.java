package rh.ptp.wrap.trivify.controller;

import org.springframework.context.ApplicationEventPublisher;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rh.ptp.wrap.trivify.listener.OnPasswordResetEvent;
import rh.ptp.wrap.trivify.listener.OnRegistrationCompleteEvent;
import rh.ptp.wrap.trivify.model.entity.User;
import rh.ptp.wrap.trivify.model.request.*;
import rh.ptp.wrap.trivify.model.response.AuthResponse;
import rh.ptp.wrap.trivify.model.response.MessageResponse;
import rh.ptp.wrap.trivify.service.AuthService;

import javax.validation.Valid;

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
        return ResponseEntity.ok().body(new MessageResponse("Registration successful. A verification email has been sent to your inbox.")); // TODO nachdem die request erfolgreich returned wurde, so muss der user auf die seite weitergeleitet werden, auf der er den 6mdigit code eingeben kann (muss er das wirklich?)
    }

    @GetMapping("/register/confirm")
    public ResponseEntity<?> confirmRegistration(@RequestParam("token") String token) {
        User registeredUser = authService.confirmRegistration(token);
        return ResponseEntity.ok().body(new MessageResponse("Your account has been verified. You can now log in."));
    }

    @PostMapping("/register/resendVerificationToken")
    public ResponseEntity<?> resendVerificationToken(@RequestBody @Valid ResendVerificationTokenRequest request) {
        User registeredUser = authService.getUserByEmail(request.getEmail());
        String appUrl = "http://localhost:8080/auth/register/confirm";
        applicationEventPublisher.publishEvent(new OnRegistrationCompleteEvent(registeredUser, appUrl));
        return ResponseEntity.ok().body("A new verification link has been sent to your inbox.");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        String token = authService.login(request);
        AuthResponse authResponse = new AuthResponse(token);
        return ResponseEntity.ok().body(authResponse);
    }

    @PostMapping("/forgotPassword")
    public ResponseEntity<?> forgotPassword(@RequestBody @Valid ForgotPasswordRequest request) {
        if (authService.userExistsByEmail(request.getEmail())) {
            User forgotPasswordUser = authService.getUserByEmail(request.getEmail());
            String appUrl = "http://localhost:8080/auth/login/changeForgotPassword";
            applicationEventPublisher.publishEvent(new OnPasswordResetEvent(forgotPasswordUser, appUrl));
        }
        return ResponseEntity.ok().body(new MessageResponse("If a user with the email exists, a password reset link has been sent."));
    }

    @PostMapping("/login/savePassword")
    public ResponseEntity<?> savePassword(@RequestBody @Valid ResetPasswordRequest request, @RequestParam("token") String token) {
        authService.saveNewPassword(request, token);
        return ResponseEntity.ok().body(new MessageResponse("Password changed successfully"));
    }


    /*@PostMapping("/resetPassword")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }*/
}
