package com.food.bitesonwheels.Repository;

import com.food.bitesonwheels.models.TruckSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TruckScheduleRepository extends JpaRepository<TruckSchedule, Long> {
}
