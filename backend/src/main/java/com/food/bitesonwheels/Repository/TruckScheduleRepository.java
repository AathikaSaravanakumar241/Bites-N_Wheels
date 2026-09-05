package com.food.bitesonwheels.Repository;

import com.food.bitesonwheels.models.TruckSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;


@Repository
public interface TruckScheduleRepository extends JpaRepository<TruckSchedule, Long> {
    List<TruckSchedule> findByTruckTruckIdAndServiceDate(Long truckId,LocalDate date);

    List<TruckSchedule> findByTruckTruckId(Long Id);
}
