package com.food.bitesonwheels.Services;

import com.food.bitesonwheels.Repository.TruckRepository;
import com.food.bitesonwheels.Repository.UserRepository;
import com.food.bitesonwheels.config.JwtUtil;
import com.food.bitesonwheels.dto.*;
import com.food.bitesonwheels.models.Truck;
import com.food.bitesonwheels.models.User;
import com.food.bitesonwheels.models.enums.Role;
import com.food.bitesonwheels.models.enums.TruckStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TruckRepository truckRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;    public AuthResponse register(RegisterRequest request) {        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }        if (userRepository.existsByPhone(request.getPhone())) {
            throw new RuntimeException("Phone number already registered");
        }        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .phone(request.getPhone())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .build();

        user = userRepository.save(user);        if (request.getRole() == Role.TRUCK_OWNER) {
            Truck defaultTruck = Truck.builder()
                    .owner(user)
                    .name(request.getName() + "'s Food Truck")
                    .tagline("Fresh & Tasty On Wheels")
                    .status(TruckStatus.ACTIVE)
                    .build();
            truckRepository.save(defaultTruck);
        }        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .message("Registration successful")
                .build();
    }    public AuthResponse login(LoginRequest request) {        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));        String token = jwtUtil.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .userId(user.getUserId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .message("Login successful")
                .build();
    }
}
