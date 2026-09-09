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
    private Long truckId;


    // Lazy proxy cannot be serialised once the Hibernate session closes
    // (spring.jpa.open-in-view=false), so keep it out of the JSON.
    // Same pattern as MenuItem.truck / Orders / OrderItem.
    // One truck per owner, enforced by uq_truck_owner in the database
    // (docs/one-truck-per-owner.sql). TruckService.getCurrentTruck() resolves
    // the truck with findByOwnerUserId -> Optional<Truck>, which throws if an
    // owner ever holds two, taking every vendor page down for that account.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
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
    private TruckStatus status = TruckStatus.ACTIVE;

    // Owner-editable profile. All nullable: a truck is created at registration
    // with only a name, and the owner fills these in later.
    @Column(length = 60)
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
