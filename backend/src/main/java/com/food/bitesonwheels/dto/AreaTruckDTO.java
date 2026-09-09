package com.food.bitesonwheels.dto;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;

/**
 * One truck that is scheduled to visit a given area (station) today,
 * together with the food it is carrying.
 *
 * Powers the customer flow: pick an area -> see the food coming to it.
 * Built as a DTO (not the entity) so nothing lazy is serialised and the
 * customer never sees owner / internal fields.
 */
@Getter
@Builder
public class AreaTruckDTO {

    private Long      truckId;
    private String    truckName;
    private String    tagline;
    private String    truckStatus;

    /** Schedule row for THIS area today. */
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
