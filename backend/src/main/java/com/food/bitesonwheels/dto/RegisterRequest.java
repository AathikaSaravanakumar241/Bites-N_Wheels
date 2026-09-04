package com.food.bitesonwheels.dto;

import com.food.bitesonwheels.models.enums.Role;
import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank
    private String name;

    @NotBlank @Email
    private String email;

    private String phone;

    @NotBlank @Size(min = 6)
    private String password;

    @NotNull
    private Role role; 
}
