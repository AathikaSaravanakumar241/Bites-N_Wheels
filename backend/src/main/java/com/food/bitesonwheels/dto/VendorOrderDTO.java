package com.food.bitesonwheels.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * An order as the truck owner needs to see it.
 *
 * The Orders entity cannot be serialised directly for this screen: `user` and
 * OrderItem's `item` are @JsonIgnore'd to keep lazy proxies out of the JSON,
 * which left the vendor table with no customer name ("Guest") and no dish
 * names ("Food Item"). Flattening those here inside the transaction gives the
 * page the names it needs and removes the lazy-serialisation hazard entirely.
 *
 * Mirrors OrderSummaryDTO on the customer side.
 */
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

    /** Name of the stop this order is tied to, when it has one. */
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
