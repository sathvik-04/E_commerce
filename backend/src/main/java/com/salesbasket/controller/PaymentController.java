package com.salesbasket.controller;

import com.salesbasket.dto.*;
import com.salesbasket.service.OrderService;
import com.salesbasket.service.RazorpayService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final RazorpayService razorpayService;
    private final OrderService orderService;

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
     * On success, converts cart items into a permanent Order and clears the user's cart.
     */
    @PostMapping("/verify")
    public ResponseEntity<MessageResponse> verifyPayment(
            @Valid @RequestBody PaymentVerifyRequest request) {

        log.info("Received payment verification request for order: {}, paymentId: {}",
                request.getRazorpayOrderId(), request.getRazorpayPaymentId());

        boolean valid = razorpayService.verifyPayment(
                request.getRazorpayOrderId(),
                request.getRazorpayPaymentId(),
                request.getRazorpaySignature()
        );

        if (valid) {
            try {
                orderService.createOrderFromCart(
                        request.getRazorpayOrderId(),
                        request.getRazorpayPaymentId()
                );
                return ResponseEntity.ok(
                        new MessageResponse("Payment successful! Your order has been placed."));
            } catch (Exception e) {
                log.error("Failed to save order after payment: {}", e.getMessage(), e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(new MessageResponse("Payment verified, but failed to save order: " + e.getMessage()));
            }
        }

        log.warn("Signature verification failed for order: {}", request.getRazorpayOrderId());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new MessageResponse("Payment verification failed. Invalid signature."));
    }
}
