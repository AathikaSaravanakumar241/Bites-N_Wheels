package com.food.bitesonwheels.Controllers;
import com.food.bitesonwheels.Services.TruckService;
import com.food.bitesonwheels.dto.VendorOrderDTO;
import com.food.bitesonwheels.models.MenuItem;
import com.food.bitesonwheels.models.Truck;
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

    /** The signed-in owner's truck. */
    @GetMapping("/me")
    public ResponseEntity<Truck> getMyTruck() {
        return ResponseEntity.ok(truckService.getMyTruck());
    }

    /** Update the signed-in owner's truck profile (partial patch). */
    @PutMapping("/me")
    public ResponseEntity<Truck> updateMyTruck(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(truckService.updateMyTruck(body));
    }

    /** The "taking orders" switch. Body: {"open": true|false} */
    @PatchMapping("/me/status")
    public ResponseEntity<Truck> setOpen(@RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(
                truckService.setOpen(Boolean.parseBoolean(String.valueOf(body.get("open")))));
    }


    // ---- request-body readers -------------------------------------------
    // The menu form sends `null` for fields the owner left blank (notably
    // stockQuantity), so reading them with .toString() threw a 500. These
    // keep a blank optional field blank and give a clear 400-style message
    // for a genuinely missing required one.

    private static String reqStr(Map<String, Object> body, String key) {
        Object v = body.get(key);
        if (v == null || String.valueOf(v).isBlank())
            throw new IllegalArgumentException(key + " is required");
        return String.valueOf(v).trim();
    }

    private static int intOr(Map<String, Object> body, String key, int fallback) {
        Object v = body.get(key);
        if (v == null || String.valueOf(v).isBlank()) return fallback;
        try {
            return (int) Double.parseDouble(String.valueOf(v));
        } catch (NumberFormatException e) {
            throw new IllegalArgumentException(key + " must be a number");
        }
    }

    @PostMapping("/menu-items")
    public ResponseEntity<MenuItem> createMenuItem(@RequestBody Map<String,Object> body){
         return ResponseEntity.ok(truckService.createMenuItem(
                reqStr(body, "name"),
                new BigDecimal(reqStr(body, "price")),
                reqStr(body, "description"),
                FoodType.valueOf(reqStr(body, "foodType")),
                intOr(body, "stockQuantity", 0),
                reqStr(body, "categoryTag")
        ));
    }

    @PutMapping("/menu-items/{itemId}")
    public ResponseEntity<MenuItem> updateMenuItem( 
        @PathVariable Long itemId, 
        @RequestBody Map<String,Object> body){

            return ResponseEntity.ok(truckService.updateMenuItem(
                itemId,
                reqStr(body, "name"),
                new BigDecimal(reqStr(body, "price")),
                reqStr(body, "description"),
                FoodType.valueOf(reqStr(body, "foodType")),
                intOr(body, "stockQuantity", 0),
                reqStr(body, "categoryTag")
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
    public ResponseEntity<List<VendorOrderDTO>> getOrders(
            @RequestParam(required = false) OrderType type) {
        return ResponseEntity.ok(truckService.getOrders(type));
    }

    @PatchMapping("/orders/{orderId}/status")
    public ResponseEntity<VendorOrderDTO> updateOrderStatus(
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
        // stationId is optional for a walk-in sale - calling toString() on a
        // missing value is what used to blow up every bill with an NPE.
        Object rawStation = body.get("stationId");
        Long stationId = (rawStation == null || rawStation.toString().isBlank())
                ? null
                : Long.valueOf(rawStation.toString());

        return ResponseEntity.ok(truckService.createOfflineOrder(
                stationId,
                new BigDecimal(body.get("totalAmount").toString()),
                (List<Map<String, Object>>) body.get("items")
        ));
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        return ResponseEntity.ok(truckService.getDashboardStats());
    }

}
