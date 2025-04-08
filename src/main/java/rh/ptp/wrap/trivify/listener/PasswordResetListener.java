package rh.ptp.wrap.trivify.listener;

import org.springframework.context.ApplicationListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import rh.ptp.wrap.trivify.model.entity.old.User;
import rh.ptp.wrap.trivify.service.AuthService;

import java.util.UUID;

@Component
public class PasswordResetListener implements ApplicationListener<OnPasswordResetCompleteEvent> {

    private final AuthService authService;

    private final JavaMailSender javaMailSender;

    public PasswordResetListener(AuthService authService, JavaMailSender javaMailSender) {
        this.authService = authService;
        this.javaMailSender = javaMailSender;
    }

    @Override
    public void onApplicationEvent(OnPasswordResetCompleteEvent event) {
        this.confirmReset(event);
    }

    private void confirmReset(OnPasswordResetCompleteEvent event) {
        User user = event.getUser();
        String token = UUID.randomUUID().toString();
        authService.createAuthenticationToken(user, token);

        String recipientAddress = user.getEmail();
        String subject = "Password Reset";
        String confirmationUrl = event.getAppUrl() + "?token=" + token;
        String message = "Password Reset";

        SimpleMailMessage email = new SimpleMailMessage();
        email.setTo(recipientAddress);
        email.setSubject(subject);
        email.setText(message + "\r\n" + confirmationUrl);
        javaMailSender.send(email);
    }
}