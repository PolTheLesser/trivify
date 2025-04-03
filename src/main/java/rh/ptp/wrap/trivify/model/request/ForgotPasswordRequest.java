package rh.ptp.wrap.trivify.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ForgotPasswordRequest {
    private String email; //TODO: kann auch uniqueIdentifier sein, da username und email unique sind
}
