package com.food.bitesonwheels.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalTime;

@Getter
@Builder
@AllArgsConstructor
public class TrackingDTO {
    private Long   orderId;
    private String status;
    private String truckName;
    private String currentStation;
    private String nextStation;
    private LocalTime arrivalTime;
    private LocalTime departureTime;
}
