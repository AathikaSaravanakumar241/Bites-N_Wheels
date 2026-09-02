package com.food.bitesonwheels.Repository;

import com.food.bitesonwheels.models.DemandInsight;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DemandInsightRepository extends JpaRepository<DemandInsight, Long> {
}
