package rh.ptp.wrap.trivify.service;

import org.springframework.stereotype.Service;
import rh.ptp.wrap.trivify.model.entity.User;

@Service
public class UserService {

    public User changeUserDetails(changeUserDetailsRequest request) {
        return new User();
    }
}
