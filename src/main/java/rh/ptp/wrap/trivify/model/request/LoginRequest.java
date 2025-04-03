package rh.ptp.wrap.trivify.model.request;

import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

public class LoginRequest {

    private String username;

    @NotNull
    @NotEmpty
    private String password;
}
