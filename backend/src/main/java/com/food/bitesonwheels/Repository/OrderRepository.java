package com.food.bitesonwheels.Repository;

import com.food.bitesonwheels.models.Orders;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.food.bitesonwheels.models.enums.OrderStatus;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Orders, Long> {

    Orders findByOrderIdAndUserUserId(Long orderId,Long userId);

    List<Orders> findByUserUserIdOrderByCreatedAtDesc(Long userId);

    List<Orders> findByUserUserIdAndStatusOrderByCreatedAtDesc(Long userId,OrderStatus status);

}
