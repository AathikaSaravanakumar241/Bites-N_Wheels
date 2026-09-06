package com.food.bitesonwheels.Controllers;

import com.food.bitesonwheels.Repository.UserRepository;
import com.food.bitesonwheels.Services.CartService;
import com.food.bitesonwheels.Services.OrderService;
import com.food.bitesonwheels.dto.OrderSummaryDTO;
import com.food.bitesonwheels.models.CartItem;
import com.food.bitesonwheels.models.Orders;
import com.food.bitesonwheels.models.enums.OrderStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class OrderController {

    private final CartService cartService;
    private final OrderService orderService;
    private final UserRepository userRepository;

    @PostMapping("/cart/items")
    public ResponseEntity<List<CartItem>> addToCart(@RequestBody Map<String, Object> body) {
        Long foodId   = Long.parseLong(body.get("foodId").toString());
        int  quantity = Integer.parseInt(body.get("quantity").toString());
        return ResponseEntity.ok(cartService.addItem(getUserId(), foodId, quantity));
    }

    @GetMapping("/cart")
    public ResponseEntity<Map<String, Object>> getCart() {
        List<CartItem> cart  = cartService.getCart(getUserId());
        BigDecimal     total = cartService.calculateTotal(cart);
        Map<String, Object> response = new HashMap<>();
        response.put("items", cart);
        response.put("total", total);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/cart/items/{itemId}")
    public ResponseEntity<List<CartItem>> updateCartItem(
            @PathVariable Long itemId,
            @RequestBody Map<String, Object> body) {
        int quantity = Integer.parseInt(body.get("quantity").toString());
        return ResponseEntity.ok(cartService.updateItem(getUserId(), itemId, quantity));
    }

    @DeleteMapping("/cart/items/{itemId}")
    public ResponseEntity<List<CartItem>> deleteCartItem(@PathVariable Long itemId) {
        return ResponseEntity.ok(cartService.removeItem(getUserId(), itemId));
    }

    @PostMapping("/orders")
    public ResponseEntity<Map<String, Object>> placeOrder(@RequestBody Map<String, Object> body) {
        Long truckId = Long.parseLong(body.get("truckId").toString());
        Orders order = orderService.placeOrder(getUserId(), truckId);
        Map<String, Object> response = new HashMap<>();
        response.put("orderId",     order.getOrderId());
        response.put("status",      order.getStatus());
        response.put("totalAmount", order.getTotalAmount());
        response.put("message",     "Order placed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/orders/{orderId}")
    public ResponseEntity<OrderSummaryDTO> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId, getUserId()));
    }

    @GetMapping("/orders")
    public ResponseEntity<List<OrderSummaryDTO>> getOrders(
            @RequestParam(required = false) OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrders(getUserId(), status));
    }

    private Long getUserId() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"))
                .getUserId();
    }
}
