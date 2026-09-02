package com.food.bitesonwheels.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.OffsetDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

/**
 * Persisted result of a demand analysis run. Optional for the first working
 * version - the service can aggregate straight from orders / order_item /
 * truck_schedule and return the suggestion without storing it.
 */
@Entity
@Table(name = "demand_insight")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DemandInsight {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "insight_id")
    private Long insightId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "truck_id", nullable = false)
    private Truck truck;

    /** Null when the insight is about the truck overall, not one station. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "station_id")
    private Station station;

    @Column(name = "period_start", nullable = false)
    private LocalDate periodStart;

    @Column(name = "period_end", nullable = false)
    private LocalDate periodEnd;

    /** ORDER_COUNT, REVENUE, TOP_ITEM, ... */
    @Column(nullable = false, length = 60)
    private String metric;

    @Column(nullable = false, columnDefinition = "text")
    private String suggestion;

    @Column(name = "created_at", nullable = false, updatable = false, insertable = false)
    private OffsetDateTime createdAt;
}
