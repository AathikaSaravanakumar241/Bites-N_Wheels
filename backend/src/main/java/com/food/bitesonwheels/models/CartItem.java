package com.food.bitesonwheels.models;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartItem {
    private Long foodId;
    private Long truckId;
    private String name ;
    private int quantity;
    private BigDecimal price ;
}
