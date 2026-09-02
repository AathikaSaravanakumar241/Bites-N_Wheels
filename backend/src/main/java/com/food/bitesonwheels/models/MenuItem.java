package com.food.bitesonwheels.models;

import com.food.bitesonwheels.models.enums.FoodType;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * The permanent catalogue of a truck - one row per dish, reused every day.
 *
 * <p>Deliberately owned by {@link Truck} and NOT by {@link Menu}. If a dish were
 * recreated for each daily menu, the same food would have a different item_id
 * every day and the 7-day demand analytics could never group by item.
 */
@Entity
@Table(name = "menu_item")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "item_id")
    private Long itemId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "truck_id", nullable = false)
    private Truck truck;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    /** Pizza, Chinese, South Indian, Dessert, ... */
    @Column(name = "category_tag", nullable = false, length = 60)
    private String categoryTag;

    @Enumerated(EnumType.STRING)
    @Column(name = "food_type", nullable = false, length = 10)
    private FoodType foodType;

    @Column(nullable = false)
    @Builder.Default
    private Boolean available = true;

    /** Null means the owner does not track stock for this dish. */
    @Column(name = "stock_quantity")
    private Integer stockQuantity;

    /** Optional "back at 7:00 PM" hint shown on the unavailable-food screen. */
    @Column(name = "available_from")
    private LocalTime availableFrom;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private OffsetDateTime createdAt;
}
