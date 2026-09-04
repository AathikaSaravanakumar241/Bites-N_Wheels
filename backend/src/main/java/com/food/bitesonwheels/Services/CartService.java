package com.food.bitesonwheels.Services;

import com.food.bitesonwheels.Repository.MenuItemRepository;
import com.food.bitesonwheels.models.CartItem;
import com.food.bitesonwheels.models.MenuItem;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class CartService {
    private final MenuItemRepository menuItemRepository;

    private final Map<Long,List<CartItem>> cartStore = new HashMap<>(); 

    public List<CartItem> addItem(Long userId,Long foodId,int quantity){

        MenuItem item = menuItemRepository.findById(foodId).orElseThrow(()-> new RuntimeException("Food not found: " + foodId));
        List<CartItem> cart = cartStore.getOrDefault(userId,new ArrayList<>());

        boolean mixedtruck = cart.stream().filter(c->!c.getTruckId().equals(item.getTruck().getTruckId())).count()>0;
        if(mixedtruck){
            throw new RuntimeException("You can't add items from different trucks in the same order");
        }
        CartItem existing = cart.stream().filter(c->c.getFoodId().equals(foodId)).findFirst().orElse(null);
        
        if(existing!=null){
            existing.setQuantity(existing.getQuantity()+quantity);
        }else{
            cart.add(new CartItem(item.getItemId(),item.getTruck().getTruckId(),item.getName(),quantity,item.getPrice()));
        }

        cartStore.put(userId,cart);
        return cart; 
    }
    public List<CartItem> getCart(Long userId){
        return cartStore.getOrDefault(userId,new ArrayList<>());
    }

    public List<CartItem> updateItem(Long userId,Long foodId,int quantity){
        List<CartItem> cart = cartStore.getOrDefault(userId,new ArrayList());
        cart.stream().filter(c->c.getFoodId().equals(foodId)).findFirst().ifPresent(c->c.setQuantity(quantity));
        cartStore.put(userId,cart);
        return cart;
    }

    public List<CartItem> removeItem(Long userId,Long foodId){
        List<CartItem> cart = cartStore.getOrDefault(userId,new ArrayList());
        cart.removeIf(c->c.getFoodId().equals(foodId));
        cartStore.put(userId,cart);
        return cart;
    }

    public BigDecimal calculateTotal(List<CartItem> cart) {
        return cart.stream().map(c -> c.getPrice().multiply(BigDecimal.valueOf(c.getQuantity()))).reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void clearCart(Long userId){
        cartStore.remove(userId);
    }

}
