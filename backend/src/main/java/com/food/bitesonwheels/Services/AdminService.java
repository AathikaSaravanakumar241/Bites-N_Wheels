package com.food.bitesonwheels.Services;

import com.food.bitesonwheels.Repository.TruckRepository;
import com.food.bitesonwheels.Repository.UserRepository;
import com.food.bitesonwheels.models.Truck;
import com.food.bitesonwheels.models.User;
import com.food.bitesonwheels.models.enums.Role;
import com.food.bitesonwheels.models.enums.TruckStatus;
import com.food.bitesonwheels.models.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository  userRepository;
    private final TruckRepository truckRepository;

    public List<User> getUsers(Role role, UserStatus status) {
        if (role != null)   return userRepository.findByRole(role);
        if (status != null) return userRepository.findByStatus(status);
        return userRepository.findAll();
    }

    public User updateUserStatus(Long userId, UserStatus status) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found: " + userId));
        user.setStatus(status);
        return userRepository.save(user);
    }

    public List<Truck> getTrucks(TruckStatus status) {
        if (status != null) return truckRepository.findByStatus(status);
        return truckRepository.findAll();
    }

    public Truck updateTruckStatus(Long truckId, TruckStatus status) {
        Truck truck = truckRepository.findById(truckId)
                .orElseThrow(() -> new RuntimeException("Truck not found: " + truckId));
        truck.setStatus(status);
        return truckRepository.save(truck);
    }
}
