package rh.ptp.wrap.trivify.model.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VerifyEmailRequest {

    String verificationToken;
}
