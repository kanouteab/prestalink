package com.prestalink.api.favorite;

import com.prestalink.api.user.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "favorite_publications",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_favorite_user_publication",
                columnNames = {"user_id", "publication_id", "publication_type"}
        )
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FavoritePublication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "publication_id", nullable = false)
    private Long publicationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "publication_type", nullable = false)
    private FavoritePublicationType publicationType;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}

