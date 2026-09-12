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
public class VendorOrderDTO {

    private Long orderId;
    private String status;
    private String orderType;
    private String rejectReason;
    private OffsetDateTime scheduledTime;
    private BigDecimal totalAmount;
    private OffsetDateTime createdAt;

    private String customerName;
    private String customerPhone;

    private String stationName;

    private List<ItemDTO> items;

    @Getter
    @Builder
    @AllArgsConstructor
    public static class ItemDTO {
        private Long itemId;
        private String name;
        private Integer quantity;
        private BigDecimal priceAtOrder;
    }
}
