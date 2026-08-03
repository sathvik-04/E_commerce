package com.salesbasket.controller;

import com.salesbasket.dto.*;
import com.salesbasket.service.CartService;
import com.salesbasket.service.RazorpayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final RazorpayService razorpayService;
    private final CartService cartService;

    /**
     * Step 1 — Frontend calls this to create a Razorpay order.
     * Returns orderId, amount, currency, and the publishable keyId.
     */
    @PostMapping("/create-order")
    public ResponseEntity<PaymentOrderResponse> createOrder(
            @Valid @RequestBody PaymentOrderRequest request) {
        PaymentOrderResponse response = razorpayService.createOrder(request.getAmount());
        return ResponseEntity.ok(response);
    }

    /**
     * Step 2 — After Razorpay checkout completes, frontend sends the three
     * Razorpay identifiers here for server-side HMAC signature verification.
     * On success, clears the user's cart.
     */
    @PostMapping("/verify")
    public ResponseEntity<MessageResponse> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {

        boolean valid = razorpayService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (valid) {
            // Payment confirmed — clear the cart
            cartService.clearCart();
            return ResponseEntity.ok(
                    new MessageResponse("Payment successful! Your order has been placed."));
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Payment verification failed. Please contact support."));
    }
}
