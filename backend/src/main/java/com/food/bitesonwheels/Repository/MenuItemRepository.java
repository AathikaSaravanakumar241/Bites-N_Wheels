package com.food.bitesonwheels.Repository;

import com.food.bitesonwheels.models.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;
import org.springframework.data.jpa.repository.Query;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    @Query("SELECT DISTINCT m.categoryTag FROM MenuItem m WHERE m.categoryTag IS NOT NULL")
    List<String> findAllDistinctCategoryTag();

    List<MenuItem> findByTruckTruckId(Long truckId);

    List<MenuItem> findByTruckTruckIdAndAvailableTrue(Long truckId);

    List<MenuItem> findByNameContainingIgnoreCaseOrDescriptionContainingIgnoreCase(String name, String desc);

    List<MenuItem> findByCategoryTagIgnoreCase(String tag);
}
