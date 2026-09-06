package com.food.bitesonwheels.Repository;

import com.food.bitesonwheels.models.User;
import com.food.bitesonwheels.models.enums.Role;
import com.food.bitesonwheels.models.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    List<User> findByRole(Role role);
    List<User> findByStatus(UserStatus status);
}
