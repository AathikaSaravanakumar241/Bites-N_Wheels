package com.food.bitesonwheels.models;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "item_id", nullable = false)
    private MenuItem item;

    @Column(name = "insight_date", nullable = false)
    private LocalDate insightDate;

    @Column(name = "predicted_demand", nullable = false)
    private Integer predictedDemand;

    @Column(name = "actual_demand")
    private Integer actualDemand;

    @Column(name = "confidence_score", precision = 5, scale = 4)
    private BigDecimal confidenceScore;
}
