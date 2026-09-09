package com.food.bitesonwheels.Services;

import com.food.bitesonwheels.Repository.*;
import com.food.bitesonwheels.models.*;
import com.food.bitesonwheels.models.enums.*;
import com.food.bitesonwheels.dto.VendorOrderDTO;
import com.food.bitesonwheels.models.User;
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

    /**
     * The truck belonging to the signed-in owner. Registration creates
     * exactly one, so the client never needs to pick a truck - it only
     * needs to know which one it is (for labelling and prefill).
     */
    public Truck getMyTruck() {
        return getCurrentTruck();
    }

    /**
     * Update the owner's own truck profile. Only keys present in the body are
     * touched, so the page can send a partial patch. `status` is handled
     * separately by setOpen - a customer-facing flag, not a profile field.
     */
    @Transactional
    public Truck updateMyTruck(Map<String, Object> body) {
        Truck truck = getCurrentTruck();

        if (body.containsKey("name")) {
            String name = str(body.get("name"));
            // name is NOT NULL in the schema; ignore an attempt to blank it.
            if (name != null && !name.isBlank()) truck.setName(name.trim());
        }
        if (body.containsKey("tagline"))   truck.setTagline(str(body.get("tagline")));
        if (body.containsKey("cuisine"))   truck.setCuisine(str(body.get("cuisine")));
        if (body.containsKey("spiceLevel")) truck.setSpiceLevel(str(body.get("spiceLevel")));
        if (body.containsKey("phone"))     truck.setPhone(str(body.get("phone")));
        if (body.containsKey("parkedAt"))  truck.setParkedAt(str(body.get("parkedAt")));
        if (body.containsKey("vegOnly"))   truck.setVegOnly(Boolean.parseBoolean(String.valueOf(body.get("vegOnly"))));
        if (body.containsKey("opensAt"))   truck.setOpensAt(time(body.get("opensAt")));
        if (body.containsKey("closesAt"))  truck.setClosesAt(time(body.get("closesAt")));

        return truckRepository.save(truck);
    }

    /**
     * The "taking orders" switch. INACTIVE is what hides a truck from the
     * customer area pages (see StationService.getTrucksAtStation).
     */
    @Transactional
    public Truck setOpen(boolean open) {
        Truck truck = getCurrentTruck();
        truck.setStatus(open ? TruckStatus.ACTIVE : TruckStatus.INACTIVE);
        return truckRepository.save(truck);
    }

    private static String str(Object v) {
        if (v == null) return null;
        String s = String.valueOf(v).trim();
        return s.isEmpty() ? null : s;
    }

    /** Accepts "16:00" and "16:00:00" from the browser's time input. */
    private static LocalTime time(Object v) {
        String s = str(v);
        if (s == null) return null;
        return LocalTime.parse(s.length() == 5 ? s + ":00" : s);
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
        scheduleRepository.deleteAll(existing); // clear old setup before re-planning

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
    /**
     * Orders for the owner's truck, flattened into VendorOrderDTO.
     *
     * The Orders entity hides `user` and OrderItem.`item` behind @JsonIgnore
     * (lazy proxies must not reach Jackson with open-in-view=false), so the
     * vendor table had no customer or dish names and fell back to "Guest" and
     * "Food Item". Mapping here, inside the transaction, reads those
     * associations while the session is open and hands the page real names.
     */
    @Transactional(readOnly = true)
    public List<VendorOrderDTO> getOrders(OrderType type) {
        Truck truck = getCurrentTruck();
        List<Orders> orders = (type != null)
                ? orderRepository.findByTruckTruckIdAndOrderType(truck.getTruckId(), type)
                : orderRepository.findByTruckTruckId(truck.getTruckId());

        return orders.stream().map(TruckService::toVendorDTO).toList();
    }

    @Transactional
    public VendorOrderDTO updateOrderStatus(Long orderId, OrderStatus status) {
        Orders order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        // An owner may only touch orders on their own truck.
        Truck truck = getCurrentTruck();
        if (!order.getTruck().getTruckId().equals(truck.getTruckId())) {
            throw new RuntimeException("That order belongs to another truck.");
        }

        order.setStatus(status);
        return toVendorDTO(orderRepository.save(order));
    }

    /** Reads the lazy associations - only safe inside a transaction. */
    private static VendorOrderDTO toVendorDTO(Orders order) {
        User customer = order.getUser();

        List<VendorOrderDTO.ItemDTO> items = order.getItems().stream()
                .map(oi -> VendorOrderDTO.ItemDTO.builder()
                        .itemId(oi.getItem() == null ? null : oi.getItem().getItemId())
                        .name(oi.getItem() == null ? "Item" : oi.getItem().getName())
                        .quantity(oi.getQuantity())
                        .priceAtOrder(oi.getPriceAtOrder())
                        .build())
                .toList();

        return VendorOrderDTO.builder()
                .orderId(order.getOrderId())
                .status(order.getStatus() == null ? null : order.getStatus().name())
                .orderType(order.getOrderType() == null ? null : order.getOrderType().name())
                .rejectReason(order.getRejectReason())
                .scheduledTime(order.getScheduledTime())
                .totalAmount(order.getTotalAmount())
                .createdAt(order.getCreatedAt())
                // Walk-in (OFFLINE) orders genuinely have no customer row.
                .customerName(customer == null ? "Walk-in" : customer.getName())
                .customerPhone(customer == null ? null : customer.getPhone())
                .stationName(order.getSchedule() == null || order.getSchedule().getStation() == null
                        ? null
                        : order.getSchedule().getStation().getName())
                .items(items)
                .build();
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