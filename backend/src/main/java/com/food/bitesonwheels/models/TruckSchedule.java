package com.food.bitesonwheels.models;
import java.time.LocalDate;
import java.time.LocalTime;
import lombok.Data;

@Data
public class TruckSchedule {
    private Long schedule_id ;
    private Long truck_id ;
    private Long station_id ;
    private LocalDate service_date ;
    private LocalTime arrival_time ;
    private LocalTime departure_time ;
    private UserStatus status ;

    public TruckSchedule(Long schedule_id, Long truck_id, Long station_id, LocalDate service_date, LocalTime arrival_time, LocalTime departure_time, UserStatus status) {
        this.schedule_id = schedule_id;
        this.truck_id = truck_id;
        this.station_id = station_id;
        this.service_date = service_date;
        this.arrival_time = arrival_time;
        this.departure_time = departure_time;
        this.status = status;
    }

}