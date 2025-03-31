package rh.ptp.wrap.trivify.listener;

import lombok.Getter;
import lombok.Setter;
import org.springframework.context.ApplicationEvent;
import rh.ptp.wrap.trivify.model.entity.User;

@Getter
@Setter
public class OnRegistrationCompleteEvent extends ApplicationEvent {

    private String appUrl;
    private User user;


    public OnRegistrationCompleteEvent(
            User user, String appUrl) {
        super(user);

        this.user = user;
        this.appUrl = appUrl;
    }
}
