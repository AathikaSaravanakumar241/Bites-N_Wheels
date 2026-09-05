package com.food.bitesonwheels.Services;

import com.food.bitesonwheels.Repository.*;
import com.food.bitesonwheels.models.*;
import com.food.bitesonwheels.models.enums.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service 
@RequiredArgsConstructor
public class TruckService {
 private final UserRepository userRepository;
 private final TruckRepository truckRepository;
  private final MenuItemRepository     menuItemRepository;
    private final TruckScheduleRepository scheduleRepository;
    private final OrderRepository        orderRepository;
    private final StationRepository      stationRepository;

    private Truck getCurrentTruck(){
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email).orElseThrow(()-> new RuntimeException("User not found"));
        return truckRepository.findByOwnerUserId(user.getUserId()).orElseThrow(()-> new RuntimeException("No truck found for this owner"));
    }

    public MenuItem createMenuItem(String name, BigDecimal price,
                                   String description, FoodType foodType,
                                   int stockQty, String categoryTag) {
        Truck truck = getCurrentTruck();
        MenuItem item = MenuItem.builder()
                .truck(truck)
                .name(name)
                .price(price)
                .description(description)
                .foodType(foodType)
                .stockQuantity(stockQty)
                .categoryTag(categoryTag)
                .available(true)
                .build();
        return menuItemRepository.save(item);
    }

     public MenuItem updateMenuItem(Long itemId, String name, BigDecimal price,
                                   String description, FoodType foodType,
                                   int stockQty, String categoryTag) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        item.setName(name);
        item.setPrice(price);
        item.setDescription(description);
        item.setFoodType(foodType);
        item.setStockQuantity(stockQty);
        item.setCategoryTag(categoryTag);
        return menuItemRepository.save(item);
    }
    public MenuItem updateAvailability(Long itemId, boolean available, int stockQty) {
        MenuItem item = menuItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));
        item.setAvailable(available);
        item.setStockQuantity(stockQty);
        return menuItemRepository.save(item);
    }
     public List<MenuItem> getMyMenuItems() {
        Truck truck = getCurrentTruck();
        return menuItemRepository.findByTruckTruckId(truck.getTruckId());
    }
    @Transactional 
    public List<TruckSchedule> setupToday(List<Map<String,Object>> stations){
        Truck truck = getCurrentTruck();
        LocalDate today = LocalDate.now();
        List<TruckSchedule> existing  = scheduleRepository.findByTruckTruckIdAndServiceDate(truck.getTruckId(), today);
        
        List<TruckSchedule> newSchedules=stations.stream().map(s->{
            Long stationId = Long.valueOf(s.get("stationId").toString());
            Station station = stationRepository.findById(stationId).orElseThrow(()-> new RuntimeException("Station not found"+stationId));
            return TruckSchedule.builder()
                    .truck(truck)
                    .station(station)
                    .serviceDate(today)
                    .arrivalTime(LocalTime.parse(s.get("arrivalTime").toString()))
                    .departureTime(LocalTime.parse(s.get("departureTime").toString()))
                    .status(ScheduleStatus.PLANNED)
                    .build();
        }).toList();
        return scheduleRepository.saveAll(newSchedules);

    }
     public TruckSchedule updateSchedule(Long scheduleId, LocalTime arrivalTime,
                                        LocalTime departureTime, ScheduleStatus status) {
        TruckSchedule schedule = scheduleRepository.findById(scheduleId)
                .orElseThrow(() -> new RuntimeException("Schedule not found"));
        schedule.setArrivalTime(arrivalTime);
        schedule.setDepartureTime(departureTime);
        schedule.setStatus(status);
        return scheduleRepository.save(schedule);
    }
     public List<Orders> getOrders(OrderType type) {
        Truck truck = getCurrentTruck();
        if (type != null) {
            return orderRepository.findByTruckTruckIdAndOrderType(truck.getTruckId(), type);
        }
        return orderRepository.findByTruckTruckId(truck.getTruckId());
    }
      public Orders updateOrderStatus(Long orderId, OrderStatus status) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        order.setStatus(status);
        return orderRepository.save(order);
    }

        public String generatePickupToken(Long orderId) {
        orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        int token = 100000 + new Random().nextInt(900000);
        return String.valueOf(token);
    }

        @Transactional
    public Orders createOfflineOrder(Long stationId, BigDecimal totalAmount,
                                     List<Map<String, Object>> items) {
        Truck truck = getCurrentTruck();
        Station station = stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found"));
        List<TruckSchedule> schedules =
                scheduleRepository.findByTruckTruckIdAndServiceDate(
                        truck.getTruckId(), LocalDate.now());
        TruckSchedule schedule = schedules.stream()
                .filter(s -> s.getStation().getStationId().equals(stationId))
                .findFirst().orElse(null);
        Orders order = Orders.builder()
                .truck(truck)
                .schedule(schedule)
                .orderType(OrderType.OFFLINE)
                .status(OrderStatus.COMPLETED)
                .totalAmount(totalAmount)
                .build();
        for (Map<String, Object> i : items) {
            Long itemId  = Long.valueOf(i.get("itemId").toString());
            int  qty     = Integer.parseInt(i.get("quantity").toString());
            BigDecimal price = new BigDecimal(i.get("price").toString());
            MenuItem menuItem = menuItemRepository.findById(itemId)
                    .orElseThrow(() -> new RuntimeException("Item not found: " + itemId));
            OrderItem oi = OrderItem.builder()
                    .order(order).item(menuItem)
                    .quantity(qty).priceAtOrder(price)
                    .build();
            order.getItems().add(oi);
        }
        return orderRepository.save(order);
    }
    public Map<String, Object> getDashboardStats() {
        Truck truck = getCurrentTruck();
        List<Orders> allOrders = orderRepository.findByTruckTruckId(truck.getTruckId());
        long totalOrders = allOrders.size();
        BigDecimal totalSales = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.COMPLETED)
                .map(Orders::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long pendingOrders = allOrders.stream()
                .filter(o -> o.getStatus() == OrderStatus.PENDING).count();
        return Map.of(
                "truckId",       truck.getTruckId(),
                "truckName",     truck.getName(),
                "totalOrders",   totalOrders,
                "totalSales",    totalSales,
                "pendingOrders", pendingOrders
        );
    }
}