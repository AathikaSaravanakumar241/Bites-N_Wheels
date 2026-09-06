package com.food.bitesonwheels.Controllers;

import com.food.bitesonwheels.Repository.UserRepository;
import com.food.bitesonwheels.Services.StationService;
import com.food.bitesonwheels.dto.TrackingDTO;
import com.food.bitesonwheels.models.Station;
import com.food.bitesonwheels.models.TruckSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class StationController {

    private final StationService  stationService;
    private final UserRepository  userRepository;

    @GetMapping("/trucks/{truckId}/stations/today")
    public ResponseEntity<List<TruckSchedule>> getTodayStations(@PathVariable Long truckId) {
        return ResponseEntity.ok(stationService.getTodayStations(truckId));
    }

    @GetMapping("/orders/{orderId}/tracking")
    public ResponseEntity<TrackingDTO> getTracking(@PathVariable Long orderId) {
        return ResponseEntity.ok(stationService.getOrderTracking(orderId, getUserId()));
    }

    @GetMapping("/stations/{stationId}")
    public ResponseEntity<Station> getStation(@PathVariable Long stationId) {
        return ResponseEntity.ok(stationService.getStation(stationId));
    }

    @GetMapping("/trucks/{truckId}/route/today")
    public ResponseEntity<List<TruckSchedule>> getTodayRoute(@PathVariable Long truckId) {
        return ResponseEntity.ok(stationService.getTodayRoute(truckId));
    }

    private Long getUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getUserId();
    }
}
