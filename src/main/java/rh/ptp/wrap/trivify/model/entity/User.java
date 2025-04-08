package rh.ptp.wrap.trivify.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true)
    private String email;

    private String displayName;

    private String firstName;

    private String lastName;

    private String profilePictureUrl;

    private OffsetDateTime createdAt;

    private OffsetDateTime lastLogin;

    private boolean isEnabled;

    private String phoneNumber;

    private LocalDate dateOfBirth;

    private Language preferredLanguage;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<UserAchievement> unlockedAchievements = new HashSet<>();


}
