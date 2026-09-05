package com.food.bitesonwheels.Controllers;

import com.food.bitesonwheels.Services.OrderService;
import com.food.bitesonwheels.Services.CartService;
import com.food.bitesonwheels.models.CartItem;
import com.food.bitesonwheels.models.Orders;
import com.food.bitesonwheels.models.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.HashMap;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class OrderController{
    private final CartService cartService;
    private final OrderService orderService;

    @PostMapping("/cart/items")
    public ResponseEntity<List<CartItem>> addToCart(@RequestBody Map<String,Object> body){
        Long userId = Long.parseLong(body.get("userId").toString());
        Long foodId = Long.parseLong(body.get("foodId").toString());
        int quantity = Integer.parseInt(body.get("quantity").toString());
        return ResponseEntity.ok(cartService.addItem(userId, foodId, quantity));
    }
    @GetMapping("/cart")
    public ResponseEntity<Map<String,Object>> getCart(@RequestParam Long userId){
        List<CartItem> cart = cartService.getCart(userId);
        BigDecimal total = cartService.calculateTotal(cart);
        Map<String,Object> response = new HashMap<>();
        response.put("items", cart);
        response.put("total", total);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/cart/items/{itemId}")
    public ResponseEntity<List<CartItem>> updateCartItem(
            @PathVariable Long itemId,
            @RequestParam Long userId,
            @RequestBody Map<String, Object> body) {
        int quantity = Integer.parseInt(body.get("quantity").toString());
        return ResponseEntity.ok(cartService.updateItem(userId, itemId, quantity));    
    }

    @DeleteMapping("/cart/items/{itemId}")
    public ResponseEntity<List<CartItem>> deleteCartItem(
        @PathVariable Long itemId,
        @RequestParam Long userId){
            return ResponseEntity.ok(cartService.removeItem(userId, itemId));
        }      
    @PostMapping("/orders")
    public ResponseEntity<Map<String,Object>> placeOrder(@RequestBody Map<String,Object> body){
        Long userId = Long.parseLong(body.get("userId").toString());
        Long truckId = Long.parseLong(body.get("truckId").toString());
        Orders order = orderService.placeOrder(userId, truckId);
        Map<String,Object> response = new HashMap<>();
        response.put("orderId", order.getOrderId());
        response.put("status", order.getStatus());
        response.put("totalAmount", order.getTotalAmount());
        response.put("message", "Order placed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<Orders> getOrderById(@PathVariable Long orderId, @RequestParam Long userId){
        return ResponseEntity.ok(orderService.getOrderById(orderId, userId));
    }
    @GetMapping("/orders")
    public ResponseEntity<List<Orders>> getOrder(@RequestParam Long userId, @RequestParam(required = false) OrderStatus status){
        return ResponseEntity.ok(orderService.getOrders(userId, status));
    }



    
        
}

