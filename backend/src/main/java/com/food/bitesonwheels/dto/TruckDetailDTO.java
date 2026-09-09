package com.food.bitesonwheels.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.time.LocalTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class TruckDetailDTO {

    private Long truckId;
    private String name;
    private String tagline;
    private String status;
    private List<ScheduleDTO> todaySchedules;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ScheduleDTO {
        private Long scheduleId;
        private Long stationId;
        private String stationName;
        private LocalTime arrivalTime;
        private LocalTime departureTime;
        private String status;
    }
}
