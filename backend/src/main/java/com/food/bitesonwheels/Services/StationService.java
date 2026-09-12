package com.food.bitesonwheels.Services;

import com.food.bitesonwheels.Repository.MenuItemRepository;
import com.food.bitesonwheels.Repository.OrderRepository;
import com.food.bitesonwheels.Repository.StationRepository;
import com.food.bitesonwheels.Repository.TruckScheduleRepository;
import com.food.bitesonwheels.dto.AreaTruckDTO;
import com.food.bitesonwheels.dto.TrackingDTO;
import com.food.bitesonwheels.models.Orders;
import com.food.bitesonwheels.models.Station;
import com.food.bitesonwheels.models.Truck;
import com.food.bitesonwheels.models.TruckSchedule;
import com.food.bitesonwheels.models.enums.TruckStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StationService {

    private final TruckScheduleRepository scheduleRepository;
    private final StationRepository       stationRepository;
    private final OrderRepository         orderRepository;
    private final MenuItemRepository      menuItemRepository;

    @Value("${app.demo.areas:}")
    private List<String> demoAreas;

    public List<Station> getAllStations() {
        return stationRepository.findAll()
                .stream()
                .filter(st -> demoAreas.isEmpty() || demoAreas.contains(st.getName()))
                .sorted(Comparator.comparing(Station::getName))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AreaTruckDTO> getTrucksAtStation(Long stationId) {
        stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found " + stationId));

        return scheduleRepository.findByStationAndDate(stationId, LocalDate.now())
                .stream()
                .filter(s -> s.getTruck().getStatus() != TruckStatus.INACTIVE)
                .map(s -> {
                    Truck truck = s.getTruck();

                    List<AreaTruckDTO.Item> items = menuItemRepository
                            .findByTruckTruckIdAndAvailableTrue(truck.getTruckId())
                            .stream()
                            .map(i -> AreaTruckDTO.Item.builder()
                                    .itemId(i.getItemId())
                                    .name(i.getName())
                                    .description(i.getDescription())
                                    .price(i.getPrice())
                                    .foodType(i.getFoodType() == null ? null : i.getFoodType().name())
                                    .categoryTag(i.getCategoryTag())
                                    .available(i.getAvailable())
                                    .stockQuantity(i.getStockQuantity())
                                    .build())
                            .toList();

                    return AreaTruckDTO.builder()
                            .truckId(truck.getTruckId())
                            .truckName(truck.getName())
                            .tagline(truck.getTagline())
                            .truckStatus(truck.getStatus() == null ? null : truck.getStatus().name())
                            .scheduleId(s.getScheduleId())
                            .arrivalTime(s.getArrivalTime())
                            .departureTime(s.getDepartureTime())
                            .scheduleStatus(s.getStatus() == null ? null : s.getStatus().name())
                            .items(items)
                            .build();
                })
                .toList();
    }

    public List<TruckSchedule> getTodayStations(Long truckId) {
        return scheduleRepository
                .findByTruckTruckIdAndServiceDate(truckId, LocalDate.now())
                .stream()
                .sorted(Comparator.comparing(TruckSchedule::getArrivalTime))
                .toList();
    }

    @Transactional(readOnly = true)
    public TrackingDTO getOrderTracking(Long orderId, Long userId) {
        Orders order = orderRepository.findByOrderIdAndUserUserId(orderId, userId);
        if (order == null) throw new RuntimeException("Order not found or not yours.");

        Long truckId = order.getTruck().getTruckId();
        List<TruckSchedule> schedules = getTodayStations(truckId);

        LocalTime now = LocalTime.now();

        TruckSchedule current = null;
        TruckSchedule next    = null;

        for (int i = 0; i < schedules.size(); i++) {
            TruckSchedule s = schedules.get(i);
            if (!now.isBefore(s.getArrivalTime()) &&
                (s.getDepartureTime() == null || now.isBefore(s.getDepartureTime()))) {
                current = s;
                if (i + 1 < schedules.size()) next = schedules.get(i + 1);
                break;
            }
        }

        return TrackingDTO.builder()
                .orderId(order.getOrderId())
                .status(order.getStatus().name())
                .truckName(order.getTruck().getName())
                .currentStation(current != null ? current.getStation().getName() : "In transit")
                .nextStation(next != null ? next.getStation().getName() : null)
                .arrivalTime(current != null ? current.getArrivalTime() : null)
                .departureTime(current != null ? current.getDepartureTime() : null)
                .build();
    }

    public Station getStation(Long stationId) {
        return stationRepository.findById(stationId)
                .orElseThrow(() -> new RuntimeException("Station not found: " + stationId));
    }

    public List<TruckSchedule> getTodayRoute(Long truckId) {
        return getTodayStations(truckId);
    }
}
