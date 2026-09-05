package com.food.bitesonwheels.Controllers;
import com.food.bitesonwheels.Services.TruckService;
import com.food.bitesonwheels.models.MenuItem;
import com.food.bitesonwheels.models.Orders;
import com.food.bitesonwheels.models.TruckSchedule;
import com.food.bitesonwheels.models.enums.FoodType;
import com.food.bitesonwheels.models.enums.OrderStatus;
import com.food.bitesonwheels.models.enums.OrderType;
import com.food.bitesonwheels.models.enums.ScheduleStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/truck")
@RequiredArgsConstructor
public class TruckController {
    private final TruckService truckService;

    @PostMapping("/menu-items")
    public ResponseEntity<MenuItem> createMenuItem(@RequestBody Map<String,Object> body){
         return ResponseEntity.ok(truckService.createMenuItem(
                body.get("name").toString(),
                new BigDecimal(body.get("price").toString()),
                body.get("description").toString(),
                FoodType.valueOf(body.get("foodType").toString()),
                Integer.parseInt(body.get("stockQuantity").toString()),
                body.get("categoryTag").toString()
        ));
    }

    @PutMapping("/menu-items/{itemId}")
    public ResponseEntity<MenuItem> updateMenuItem( 
        @PathVariable Long itemId, 
        @RequestBody Map<String,Object> body){

            return ResponseEntity.ok(truckService.updateMenuItem(
                itemId,
                body.get("name").toString(),
                new BigDecimal(body.get("price").toString()),
                body.get("description").toString(),
                FoodType.valueOf(body.get("foodType").toString()),
                Integer.parseInt(body.get("stockQuantity").toString()),
                body.get("categoryTag").toString()
        ));

    }

    @PatchMapping("/menu-items/{itemId}/availability")
    public ResponseEntity<MenuItem> updateAvailability(
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(truckService.updateAvailability(
                itemId,
                Boolean.parseBoolean(body.get("available").toString()),
                Integer.parseInt(body.get("stockQuantity").toString())
        ));
    }

    @GetMapping("/menu-items")
    public ResponseEntity<List<MenuItem>> getMyMenuItems() {
        return ResponseEntity.ok(truckService.getMyMenuItems());
    }

    @PostMapping("/today-setup")
    public ResponseEntity<List<TruckSchedule>> setupToday(
            @RequestBody List<Map<String, Object>> stations) {
        return ResponseEntity.ok(truckService.setupToday(stations));
    }

    @PutMapping("/stations/{scheduleId}")
    public ResponseEntity<TruckSchedule> updateSchedule(
            @PathVariable Long scheduleId,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(truckService.updateSchedule(
                scheduleId,
                LocalTime.parse(body.get("arrivalTime").toString()),
                LocalTime.parse(body.get("departureTime").toString()),
                ScheduleStatus.valueOf(body.get("status").toString())
        ));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<Orders>> getOrders(
            @RequestParam(required = false) OrderType type) {
        return ResponseEntity.ok(truckService.getOrders(type));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<Orders> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(truckService.updateOrderStatus(
                orderId,
                OrderStatus.valueOf(body.get("status").toString())
        ));
    }

    @PostMapping("/orders/{orderId}/token")
    public ResponseEntity<Map<String, String>> generateToken(@PathVariable Long orderId) {
        String token = truckService.generatePickupToken(orderId);
        return ResponseEntity.ok(Map.of("pickupToken", token, "orderId", orderId.toString()));
    }

    @PostMapping("/offline-orders")
    public ResponseEntity<Orders> createOfflineOrder(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(truckService.createOfflineOrder(
                Long.valueOf(body.get("stationId").toString()),
                new BigDecimal(body.get("totalAmount").toString()),
                (List<Map<String, Object>>) body.get("items")
        ));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(truckService.getDashboardStats());
    }

}
