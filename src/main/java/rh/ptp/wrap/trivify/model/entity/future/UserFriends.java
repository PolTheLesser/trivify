/*package rh.ptp.wrap.trivify.model.entity.future;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import rh.ptp.wrap.trivify.model.entity.FriendshipStatus;
import rh.ptp.wrap.trivify.model.entity.old.User;

import java.time.OffsetDateTime;

@Entity
@Table
@Getter
@Setter
public class UserFriends {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long friendshipId;

    private User user1;

    private User user2;

    private FriendshipStatus friendshipStatus;

    private OffsetDateTime createdAt;

    private OffsetDateTime updatedAt;
}
*/