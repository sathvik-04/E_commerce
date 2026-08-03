package com.salesbasket.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PaymentOrderRequest {

    @NotNull(message = "Amount is required")
    private BigDecimal amount; // in INR (rupees)

    private String currency = "INR";
}
