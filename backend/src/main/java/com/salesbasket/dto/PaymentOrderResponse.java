package com.salesbasket.dto;

import lombok.*;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentOrderResponse {
    private String orderId;   // Razorpay order ID (e.g. order_xxxx)
    private BigDecimal amount; // in INR rupees
    private String currency;
    private String keyId;      // Razorpay publishable key ID (safe to send to frontend)
}
