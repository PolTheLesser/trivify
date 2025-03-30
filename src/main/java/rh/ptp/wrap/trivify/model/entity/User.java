package rh.ptp.wrap.trivify.model.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;

import java.time.LocalDateTime;
import java.util.Collection;


@Entity
@Getter
@Setter
@Accessors(chain = true)
public class User {

    @Id
    private String username;

    @Column
    private String firstName;

    @Column
    private String lastName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role_name")
    private Collection<String> roles;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime lastLogin;

    @Column(name = "enabled")
    private boolean enabled;

    public User() {
        super();
        this.enabled=false;
    }
}
