package com.food.bitesonwheels.Controllers;

import com.food.bitesonwheels.Services.AdminService;
import com.food.bitesonwheels.models.Truck;
import com.food.bitesonwheels.models.User;
import com.food.bitesonwheels.models.enums.Role;
import com.food.bitesonwheels.models.enums.TruckStatus;
import com.food.bitesonwheels.models.enums.UserStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<List<User>> getUsers(
            @RequestParam(required = false) Role role,
            @RequestParam(required = false) UserStatus status) {
        return ResponseEntity.ok(adminService.getUsers(role, status));
    }

    @PatchMapping("/users/{userId}/status")
    public ResponseEntity<User> updateUserStatus(
            @PathVariable Long userId,
            @RequestBody Map<String, String> body) {
        UserStatus status = UserStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(adminService.updateUserStatus(userId, status));
    }

    @GetMapping("/trucks")
    public ResponseEntity<List<Truck>> getTrucks(
            @RequestParam(required = false) TruckStatus status) {
        return ResponseEntity.ok(adminService.getTrucks(status));
    }

    @PatchMapping("/trucks/{truckId}/status")
    public ResponseEntity<Truck> updateTruckStatus(
            @PathVariable Long truckId,
            @RequestBody Map<String, String> body) {
        TruckStatus status = TruckStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(adminService.updateTruckStatus(truckId, status));
    }
}
