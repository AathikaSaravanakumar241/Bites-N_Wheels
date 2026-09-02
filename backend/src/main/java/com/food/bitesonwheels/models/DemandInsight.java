package com.food.bitesonwheels.models;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Data
public class DemandInsight {
    private Long insight_id ;
    private Long truck_id;
    private Long station_id ;
    private LocalDate period_start ;
    private LocalDate period_end ;
    private String metric ;
    private String suggestion ;
    private LocalTime created_at;

    DemandInsight(Long insight_id, Long station_id, LocalDate date, LocalTime time, int demand_level, String notes) {
        this.insight_id = insight_id;
        this.station_id = station_id;
        this.date = date;
        this.time = time;
        this.demand_level = demand_level;
        this.notes = notes;
    }

}