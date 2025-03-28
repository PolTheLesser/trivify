package rh.ptp.wrap.trivify.model.request;

import lombok.Getter;
import lombok.Setter;
import rh.ptp.wrap.trivify.annotations.PasswordMatches;
import rh.ptp.wrap.trivify.annotations.ValidEmail;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@PasswordMatches
@Getter
@Setter
public class RegisterRequest {

    @NotNull
    @NotEmpty
    private String username;

    @ValidEmail
    @NotNull
    @NotEmpty
    private String email;

    @NotNull
    @NotEmpty
    private String password;
    private String matchingPassword;
}
