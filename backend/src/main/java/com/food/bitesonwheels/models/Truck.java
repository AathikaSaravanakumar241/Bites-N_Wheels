package com.food.bitesonwheels.models;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.food.bitesonwheels.models.enums.TruckStatus;
import jakarta.persistence.*;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "truck")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Truck {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "truck_id")
    private Long truckId;    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false, unique = true)
    @JsonIgnore
    private User owner;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 200)
    private String tagline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private TruckStatus status = TruckStatus.ACTIVE;    @Column(length = 60)
    private String cuisine;

    @Column(name = "spice_level", length = 20)
    private String spiceLevel;

    @Column(name = "veg_only", nullable = false)
    @Builder.Default
    private Boolean vegOnly = false;

    @Column(length = 20)
    private String phone;

    @Column(name = "parked_at", length = 200)
    private String parkedAt;

    @Column(name = "opens_at")
    private LocalTime opensAt;

    @Column(name = "closes_at")
    private LocalTime closesAt;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private OffsetDateTime createdAt;

}
