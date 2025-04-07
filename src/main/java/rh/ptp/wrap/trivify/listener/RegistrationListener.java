package rh.ptp.wrap.trivify.listener;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.context.ApplicationListener;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;
import rh.ptp.wrap.trivify.model.entity.User;
import rh.ptp.wrap.trivify.service.AuthService;
import rh.ptp.wrap.trivify.service.OtpGenerator;

import java.util.UUID;

@Component
public class RegistrationListener implements ApplicationListener<OnRegistrationCompleteEvent> {

    private final AuthService authService;

    private final JavaMailSender javaMailSender;

    public RegistrationListener(AuthService authService, JavaMailSender javaMailSender) {
        this.authService = authService;
        this.javaMailSender = javaMailSender;
    }

    @Override
    public void onApplicationEvent(OnRegistrationCompleteEvent event) {
        this.confirmRegistration(event);
    }

    private void confirmRegistration(OnRegistrationCompleteEvent event) {
        User user = event.getUser();
        String token = OtpGenerator.generate6DigitCode();
        authService.createAuthenticationToken(user, token);

        String recipientAddress = user.getEmail();
        String subject = "Confirm Your Email";
        String confirmationUrl = event.getAppUrl() + "?token=" + token;

        // Example of inserting the code into the HTML template
        String emailContent = buildHtmlEmail(token, confirmationUrl);

        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, "utf-8");

            helper.setTo(recipientAddress);
            helper.setSubject(subject);
            helper.setText(emailContent, true); // 'true' enables HTML

            javaMailSender.send(message);
        } catch (MessagingException e) {
            // handle error, e.g., log it or throw a custom exception

            e.printStackTrace();
        }
    }
    private String buildHtmlEmail(String otpCode, String link) {
        return """
    <!DOCTYPE html>
    <html lang="en">
    <head><meta charset="UTF-8"></head>
    <body style="font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px;">
        <div style="max-width: 600px; margin: auto; background: #fff; padding: 30px; border-radius: 12px; box-shadow: 0 5px 20px rgba(0,0,0,0.05);">
            <h2 style="color: #3c009d;">Verify Your Email</h2>
            <p>Thanks for signing up! Use the code below to complete your registration:</p>
            <div style="margin: 20px 0; font-size: 32px; font-weight: bold; color: #3c009d;">"""
                + otpCode + """
            </div>
            <p>Or click the link to confirm:</p>
            <a href='"""
                + link + """
        ' style="display: inline-block; margin-top: 10px; padding: 12px 24px; background: #4c00b4; color: #fff; text-decoration: none; border-radius: 8px;">Confirm Email</a>
        </div>
    </body>
    </html>
    """;
    }
}
