package com.food.bitesonwheels.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Data
@Builder
public class OrderSummaryDTO {

    private Long          orderId;
    private String        status;
    private String        orderType;
    private BigDecimal    totalAmount;
    private OffsetDateTime createdAt;
    private String        truckName;
    private List<ItemDTO> items;

    @Data
    @Builder
    public static class ItemDTO {
        private String     name;
        private Integer    quantity;
        private BigDecimal priceAtOrder;
    }
}
