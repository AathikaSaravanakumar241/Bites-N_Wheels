package com.food.bitesonwheels.models;

public class MenuItem {
    private Long item_id;
    private Long menu_id;
    private String name;
    private String description;
    private double price;
    private String category_tag;
    private String food_type;
    private boolean available;

    MenuItem(Long item_id, Long menu_id, String name, String description, double price, String category_tag, String food_type, boolean available) {
        this.item_id = item_id;
        this.menu_id = menu_id;
        this.name = name;
        this.description = description;
        this.price = price;
        this.category_tag = category_tag;
        this.food_type = food_type;
        this.available = available;
    }
    
}
