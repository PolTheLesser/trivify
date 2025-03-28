package rh.ptp.wrap.trivify.model.dto;

import lombok.Getter;
import lombok.Setter;
import rh.ptp.wrap.trivify.annotations.PasswordMatches;
import rh.ptp.wrap.trivify.annotations.ValidEmail;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

@PasswordMatches
@Getter
@Setter
public class UserDto {

    @NotNull
    @NotEmpty
    private String username;

    @ValidEmail
    @NotNull
    @NotEmpty
    private String email;

    @NotNull
    @NotEmpty
    private String firstName;

    @NotNull
    @NotEmpty
    private String lastName;

    @NotNull
    @NotEmpty
    private String password;

    @NotNull
    @NotEmpty
    private String matchingPassword;



}
