package rh.ptp.quizapp.model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Getter
public enum UserRole {
    USER("ROLE_USER"),
    ADMIN("ROLE_ADMIN");

    private final String role;

    UserRole(String role) {
        this.role = role;
    }

    public static List<String> getUserRoles() {
        List<String> roles = new ArrayList<>();
        Arrays.stream(UserRole.values()).forEach(userRole -> roles.add(userRole.getRole()));
        return roles;
    }
}
