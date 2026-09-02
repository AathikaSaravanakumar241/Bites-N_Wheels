package com.food.bitesonwheels.models;
import  lombok.Data;

@Data
public class User {
    private Long UserId;
    private String name ;
    private String email ;
    private int phone ;
    private String password ;
    private UserStatus status ;
    public UserType role ;


    User(Long UserId, String name, String email, int phone, String password, UserType role, UserStatus status) {
        this.UserId = UserId;
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.password = password;
        this.role = role;
        this.status = status;
    }

   
    
}
