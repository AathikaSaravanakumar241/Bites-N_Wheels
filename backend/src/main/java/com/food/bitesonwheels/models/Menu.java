package com.food.bitesonwheels.models;
import java.time.LocalTime;
import lombok.Data;

@Data
public class Menu {
    private Long menu_id ;
    private Long truck_id;
    private LocalDate menu_date;
    private UserStatus status;

    Menu(Long menu_id, Long truck_id, LocalDate menu_date, UserStatus status) {
        this.menu_id = menu_id;
        this.truck_id = truck_id;
        this.menu_date = menu_date;
        this.status = status;
    }

}
