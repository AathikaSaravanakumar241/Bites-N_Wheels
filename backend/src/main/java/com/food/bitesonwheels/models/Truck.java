package com.food.bitesonwheels.models;
import lombok.Data;

@Data
public class Truck {
    private Long truck_id ;
    private Long owner_id ;
    private String name ;
    private String tagline ;
    private UserStatus status ;

    Truck(Long truck_id, Long owner_id, String name, String tagline, UserStatus status) {
        this.truck_id = truck_id;
        this.owner_id = owner_id;
        this.name = name;
        this.tagline = tagline;
        this.status = status;
    }

}
