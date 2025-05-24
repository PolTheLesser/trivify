package rh.ptp.quizapp.model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Getter
public enum UserStatus {
    ACTIVE("ACTIVE"),
    PENDING_VERIFICATION("PENDING_VERIFICATION"),
    PENDING_DELETE("PENDING_DELETE"),
    BLOCKED("BLOCKED");

    private final String status;

    UserStatus(String status) {
        this.status = status;
    }

    public static List<String> getUserStates() {
        List<String> states = new ArrayList<>();
        Arrays.stream(UserStatus.values()).forEach(userStatus -> states.add(userStatus.getStatus()));
        return states;
    }
}
