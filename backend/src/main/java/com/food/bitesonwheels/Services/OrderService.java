package com.food.bitesonwheels.Services;

import com.food.bitesonwheels.Repository.MenuItemRepository;
import com.food.bitesonwheels.Repository.OrderRepository;
import com.food.bitesonwheels.Repository.TruckRepository;
import com.food.bitesonwheels.Repository.UserRepository;
import com.food.bitesonwheels.models.*;
import com.food.bitesonwheels.models.enums.OrderStatus;
import com.food.bitesonwheels.models.enums.OrderType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository     orderRepository;
    private final MenuItemRepository  menuItemRepository;
    private final UserRepository      userRepository;
    private final TruckRepository     truckRepository;
    private final CartService         cartService;

    @Transactional   
    public Orders placeOrder(Long userId, Long truckId) {

        List<CartItem> cart = cartService.getCart(userId);
        if (cart.isEmpty()) throw new RuntimeException("Cart is empty.");

        User  user  = userRepository.findById(userId)
                        .orElseThrow(() -> new RuntimeException("User not found"));
        Truck truck = truckRepository.findById(truckId)
                        .orElseThrow(() -> new RuntimeException("Truck not found"));

        BigDecimal total = cartService.calculateTotal(cart);

    
        Orders order = Orders.builder()
                .user(user)
                .truck(truck)
                .orderType(OrderType.ONLINE)
                .status(OrderStatus.PENDING)
                .totalAmount(total)
                .build();

       
        for (CartItem cartItem : cart) {
            MenuItem menuItem = menuItemRepository.findById(cartItem.getFoodId())
                    .orElseThrow(() -> new RuntimeException("Item not found: " + cartItem.getFoodId()));

            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .item(menuItem)
                    .quantity(cartItem.getQuantity())
                    .priceAtOrder(cartItem.getPrice())
                    .build();

            order.getItems().add(orderItem); 
        }

        Orders saved = orderRepository.save(order);
        cartService.clearCart(userId);   
        return saved;
    }


    public Orders getOrderById(Long orderId, Long userId) {
        Orders order = orderRepository.findByOrderIdAndUserUserId(orderId, userId);
        if (order == null) throw new RuntimeException("Order not found or not yours.");
        return order;
    }

  
    public List<Orders> getOrders(Long userId, OrderStatus status) {
        if (status != null) {
            return orderRepository.findByUserUserIdAndStatusOrderByCreatedAtDesc(userId, status);
        }
        return orderRepository.findByUserUserIdOrderByCreatedAtDesc(userId);
    }
}
