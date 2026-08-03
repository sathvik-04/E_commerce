package com.salesbasket.service;

import com.salesbasket.dto.OrderItemResponse;
import com.salesbasket.dto.OrderResponse;
import com.salesbasket.entity.*;
import com.salesbasket.repository.CartItemRepository;
import com.salesbasket.repository.OrderRepository;
import com.salesbasket.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    /**
     * Converts current user's cart items into a completed Order upon payment verification.
     */
    @Transactional
    public Order createOrderFromCart(String razorpayOrderId, String razorpayPaymentId) {
        User user = getCurrentUser();
        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            log.warn("Cannot create order: Cart is empty for user {}", user.getEmail());
            return null;
        }

        BigDecimal total = cartItems.stream()
                .map(item -> item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Order order = Order.builder()
                .user(user)
                .totalAmount(total)
                .status(Order.OrderStatus.PAID)
                .razorpayOrderId(razorpayOrderId)
                .razorpayPaymentId(razorpayPaymentId)
                .items(new ArrayList<>())
                .build();

        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .product(cartItem.getProduct())
                    .quantity(cartItem.getQuantity())
                    .price(cartItem.getProduct().getPrice())
                    .build();
            order.getItems().add(orderItem);
        }

        Order savedOrder = orderRepository.save(order);
        log.info("Successfully created Order ID #{} for user {}", savedOrder.getId(), user.getEmail());

        // Clear cart after order is created
        cartItemRepository.deleteByUser(user);

        return savedOrder;
    }

    public List<OrderResponse> getUserOrders() {
        User user = getCurrentUser();
        return orderRepository.findByUserOrderByCreatedAtDesc(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> itemResponses = order.getItems().stream().map(item -> {
            String imageUrl = null;
            if (item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
                imageUrl = item.getProduct().getImages().get(0).getImageUrl();
            }
            BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            return OrderItemResponse.builder()
                    .id(item.getId())
                    .productId(item.getProduct().getProductId())
                    .productName(item.getProduct().getName())
                    .imageUrl(imageUrl)
                    .quantity(item.getQuantity())
                    .price(item.getPrice())
                    .subtotal(subtotal)
                    .build();
        }).toList();

        return OrderResponse.builder()
                .id(order.getId())
                .totalAmount(order.getTotalAmount())
                .status(order.getStatus().name())
                .razorpayOrderId(order.getRazorpayOrderId())
                .razorpayPaymentId(order.getRazorpayPaymentId())
                .createdAt(order.getCreatedAt())
                .items(itemResponses)
                .build();
    }
}
