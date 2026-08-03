package com.salesbasket.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CartItemResponse {
    private Long id;
    private Long productId;
    private String productName;
    private String description;
    private BigDecimal price;
    private Integer quantity;
    private String imageUrl;
    private Integer stock;
}
