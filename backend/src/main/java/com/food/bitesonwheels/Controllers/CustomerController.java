package com.food.bitesonwheels.Controllers;

import com.food.bitesonwheels.Services.CustomerService;
import com.food.bitesonwheels.dto.TruckDetailDTO;
import com.food.bitesonwheels.models.MenuItem;
import com.food.bitesonwheels.models.Truck;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/api/v1/trucks")
    public ResponseEntity<List<Truck>> getAllTrucks() {
        return ResponseEntity.ok(customerService.getAllTrucks());
    }

    @GetMapping("/api/v1/trucks/{truckId}")
    public ResponseEntity<TruckDetailDTO> getTruckDetail(@PathVariable Long truckId) {
        return ResponseEntity.ok(customerService.getTruckDetail(truckId));
    }

    @GetMapping("/api/v1/trucks/{truckId}/menu")
    public ResponseEntity<List<MenuItem>> getTruckMenu(@PathVariable Long truckId) {
        return ResponseEntity.ok(customerService.getTruckMenu(truckId));
    }

    @GetMapping("/api/v1/foods/search")
    public ResponseEntity<Map<String, List<MenuItem>>> searchFoods(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Boolean veg) {
        return ResponseEntity.ok(customerService.searchFoods(q, tag, veg));
    }
}
