package com.food.bitesonwheels.dto;

import com.food.bitesonwheels.models.enums.Role;
import lombok.*;

@Data @Builder
@NoArgsConstructor @AllArgsConstructor
public class AuthResponse {

    private String token;
    private Long userId;
    private String name;
    private String email;
    private Role role;
    private String message;
}
