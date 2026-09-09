package com.food.bitesonwheels.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class OrderSummaryDTO {

    private Long orderId;
    private String status;
    private String orderType;
    private BigDecimal totalAmount;
    private OffsetDateTime createdAt;
    private String truckName;

    private List<ItemDTO> items;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ItemDTO {
        private String name;
        private Integer quantity;
        private BigDecimal priceAtOrder;
    }
}
