package com.food.bitesonwheels.Repository;

import com.food.bitesonwheels.models.TruckSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;


@Repository
public interface TruckScheduleRepository extends JpaRepository<TruckSchedule, Long> {
    List<TruckSchedule> findByTruckTruckIdAndServiceDate(Long truckId,LocalDate date);

    List<TruckSchedule> findByTruckTruckId(Long Id);

    @Query("""
           select s from TruckSchedule s
           join fetch s.truck t
           where s.station.stationId = :stationId
             and s.serviceDate = :date
           order by s.arrivalTime asc
           """)
    List<TruckSchedule> findByStationAndDate(@Param("stationId") Long stationId,
                                             @Param("date") LocalDate date);
}
