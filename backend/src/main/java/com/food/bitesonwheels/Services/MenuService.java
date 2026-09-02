package com.food.bitesonwheels.Services;

import com.food.bitesonwheels.Repository.MenuItemRepository;
import com.food.bitesonwheels.models.MenuItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MenuService {
    private final MenuItemRepository menuItemRepository;

    public MenuItem getFoodId(Long foodId){
        return menuItemRepository.findById(foodId).orElseThrow(()->new RuntimeException("Food item not found : "+foodId));
    }

    public List<String> getAllTag(){
        return menuItemRepository.findAllDistinctCategoryTag();
    }

    public MenuItem getFoodAvailability(Long foodId){
        return menuItemRepository.findById(foodId).orElseThrow(()-> new RuntimeException("Food item not found :"+ foodId));
    }
    public List<MenuItem> getRecommendations(Long truckId){
        return menuItemRepository.findByTruckTruckId(truckId);
    }
}
