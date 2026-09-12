package com.food.bitesonwheels.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

@Getter
@Builder
public class AreaTruckDTO {

    private Long      truckId;
    private String    truckName;
    private String    tagline;
    private String    truckStatus;

    private Long      scheduleId;
    private LocalTime arrivalTime;
    private LocalTime departureTime;
    private String    scheduleStatus;

    private List<Item> items;

    @Getter
    @Builder
    public static class Item {
        private Long       itemId;
        private String     name;
        private String     description;
        private BigDecimal price;
        private String     foodType;
        private String     categoryTag;
        private Boolean    available;
        private Integer    stockQuantity;
    }
}
