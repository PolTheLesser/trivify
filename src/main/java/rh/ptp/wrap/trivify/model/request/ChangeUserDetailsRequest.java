package rh.ptp.wrap.trivify.model.request;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.Accessors;

@Getter
@Setter
@NoArgsConstructor
@Accessors
public class ChangeUserDetailsRequest {

    private String firstName;

    private String lastName;
}
