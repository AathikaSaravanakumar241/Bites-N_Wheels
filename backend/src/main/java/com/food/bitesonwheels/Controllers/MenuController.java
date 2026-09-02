package com.food.bitesonwheels.Controllers;

import com.food.bitesonwheels.Services.MenuService;
import com.food.bitesonwheels.models.MenuItem;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1")
@RequiredArgsConstructor

public class MenuController {
    private final MenuService menuService;

    @GetMapping("/foods/{foodId}")
    public ResponseEntity<MenuItem> getFoodId(@PathVariable Long foodId) {
        return ResponseEntity.ok(menuService.getFoodId(foodId));
    }

    @GetMapping("/tags")
    public ResponseEntity<List<String>> getAllTags() {
        return ResponseEntity.ok(menuService.getAllTag());
    }

    @GetMapping("/foods/{foodId}/availability")
    public ResponseEntity<Map<String, Object>> getFoodAvailability(@PathVariable Long foodId) {
        MenuItem item = menuService.getFoodAvailability(foodId);
        Map<String, Object> response = new HashMap<>();
        response.put("foodId", item.getItemId());
        response.put("name", item.getName());
        response.put("available", item.getAvailable());
        response.put("availableFrom", item.getAvailableFrom());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/trucks/{truckId}/recommendations")
    public ResponseEntity<List<MenuItem>> getRecommendations(@PathVariable Long truckId) {
        return ResponseEntity.ok(menuService.getRecommendations(truckId));
    }

}
