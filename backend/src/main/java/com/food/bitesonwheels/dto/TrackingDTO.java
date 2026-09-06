package com.food.bitesonwheels.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalTime;

@Data
@Builder
public class TrackingDTO {

    private Long      orderId;
    private String    status;
    private String    truckName;
    private String    currentStation;
    private String    nextStation;
    private LocalTime arrivalTime;
    private LocalTime departureTime;
}
