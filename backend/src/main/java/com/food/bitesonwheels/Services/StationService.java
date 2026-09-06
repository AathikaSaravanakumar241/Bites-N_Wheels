package com.food.bitesonwheels.Services;

import com.food.bitesonwheels.Repository.OrderRepository;
import com.food.bitesonwheels.Repository.StationRepository;
import com.food.bitesonwheels.Repository.TruckScheduleRepository;
import com.food.bitesonwheels.dto.TrackingDTO;
import com.food.bitesonwheels.models.Orders;
import com.food.bitesonwheels.models.Station;
import com.food.bitesonwheels.models.TruckSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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

    public List<TruckSchedule> getTodayStations(Long truckId) {
        return scheduleRepository
                .findByTruckTruckIdAndServiceDate(truckId, LocalDate.now())
                .stream()
                .sorted(Comparator.comparing(TruckSchedule::getArrivalTime))
                .toList();
    }

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
