package com.food.bitesonwheels.Services;

import com.food.bitesonwheels.Repository.MenuItemRepository;
import com.food.bitesonwheels.Repository.TruckRepository;
import com.food.bitesonwheels.Repository.TruckScheduleRepository;
import com.food.bitesonwheels.dto.TruckDetailDTO;
import com.food.bitesonwheels.models.MenuItem;
import com.food.bitesonwheels.models.Truck;
import com.food.bitesonwheels.models.TruckSchedule;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final TruckRepository truckRepository;
    private final TruckScheduleRepository scheduleRepository;
    private final MenuItemRepository menuItemRepository;

    @Transactional(readOnly = true)
    public List<Truck> getAllTrucks() {
        return truckRepository.findAll();
    }

    public TruckDetailDTO getTruckDetail(Long truckId) {
        Truck truck = truckRepository.findById(truckId)
                .orElseThrow(() -> new RuntimeException("Truck not found: " + truckId));

        List<TruckSchedule> schedules =
                scheduleRepository.findByTruckTruckIdAndServiceDate(truckId, LocalDate.now());

        List<TruckDetailDTO.ScheduleDTO> scheduleDTOs = schedules.stream()
                .map(s -> TruckDetailDTO.ScheduleDTO.builder()
                        .scheduleId(s.getScheduleId())
                        .stationId(s.getStation().getStationId())
                        .stationName(s.getStation().getName())
                        .arrivalTime(s.getArrivalTime())
                        .departureTime(s.getDepartureTime())
                        .status(s.getStatus().name())
                        .build())
                .collect(Collectors.toList());

        return TruckDetailDTO.builder()
                .truckId(truck.getTruckId())
                .name(truck.getName())
                .tagline(truck.getTagline())
                .status(truck.getStatus().name())
                .todaySchedules(scheduleDTOs)
                .build();
    }

    public List<MenuItem> getTruckMenu(Long truckId) {
        return menuItemRepository.findByTruckTruckIdAndAvailableTrue(truckId);
    }

    @Transactional(readOnly = true)
    public Map<String, List<MenuItem>> searchFoods(String q, String tag, Boolean veg) {
        List<MenuItem> results;

        if (tag != null && !tag.isBlank()) {
            results = menuItemRepository.findByCategoryTagIgnoreCase(tag);
        } else if (q != null && !q.isBlank()) {
            results = menuItemRepository
                    .findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(q, q);
        } else {
            results = menuItemRepository.findAll();
        }

        if (Boolean.TRUE.equals(veg)) {
            results = results.stream()
                    .filter(item -> "VEG".equalsIgnoreCase(item.getFoodType().name()))
                    .collect(Collectors.toList());
        }
        return results.stream()
                .collect(Collectors.groupingBy(item ->
                        item.getTruck() != null ? item.getTruck().getName() : "Unknown"));
    }
}
