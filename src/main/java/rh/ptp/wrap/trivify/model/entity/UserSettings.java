package rh.ptp.wrap.trivify.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "user_settings")
@Data
public class UserSettings {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    //private PrivacyLevel receiveFriendRequestsFrom;

    //private PrivacyLevel receiveMessagesFrom;

    private ColorScheme colorScheme;

    private boolean enableEmailNotifications;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    private User user;
}
