package com.food.bitesonwheels.Repository;

import com.food.bitesonwheels.models.Truck;
import com.food.bitesonwheels.models.enums.TruckStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TruckRepository extends JpaRepository<Truck, Long> {
    Optional<Truck> findByOwnerUserId(Long userId);
    List<Truck> findByStatus(TruckStatus status);
}
