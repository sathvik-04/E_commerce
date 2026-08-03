package com.salesbasket.service;

import com.salesbasket.dto.CartItemResponse;
import com.salesbasket.dto.CartRequest;
import com.salesbasket.entity.CartItem;
import com.salesbasket.entity.Product;
import com.salesbasket.entity.User;
import com.salesbasket.repository.CartItemRepository;
import com.salesbasket.repository.ProductRepository;
import com.salesbasket.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    private User getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("User not found"));
    }

    public List<CartItemResponse> getCart() {
        User user = getCurrentUser();
        return cartItemRepository.findByUser(user)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public CartItemResponse addToCart(CartRequest request) {
        User user = getCurrentUser();
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found with id: " + request.getProductId()));

        // If already in cart, increase quantity
        Optional<CartItem> existing = cartItemRepository.findByUserAndProduct(user, product);
        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            return toResponse(cartItemRepository.save(item));
        }

        CartItem cartItem = CartItem.builder()
                .user(user)
                .product(product)
                .quantity(request.getQuantity())
                .build();
        return toResponse(cartItemRepository.save(cartItem));
    }

    @Transactional
    public CartItemResponse updateQuantity(Long itemId, Integer quantity) {
        User user = getCurrentUser();
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Cart item not found"));

        if (!item.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("Not authorized to modify this cart item");
        }

        item.setQuantity(quantity);
        return toResponse(cartItemRepository.save(item));
    }

    @Transactional
    public void removeFromCart(Long itemId) {
        User user = getCurrentUser();
        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new EntityNotFoundException("Cart item not found"));

        if (!item.getUser().getUserId().equals(user.getUserId())) {
            throw new IllegalArgumentException("Not authorized to modify this cart item");
        }

        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart() {
        User user = getCurrentUser();
        cartItemRepository.deleteByUser(user);
    }

    private CartItemResponse toResponse(CartItem item) {
        String imageUrl = null;
        if (item.getProduct().getImages() != null && !item.getProduct().getImages().isEmpty()) {
            imageUrl = item.getProduct().getImages().get(0).getImageUrl();
        }

        return CartItemResponse.builder()
                .id(item.getId())
                .productId(item.getProduct().getProductId())
                .productName(item.getProduct().getName())
                .description(item.getProduct().getDescription())
                .price(item.getProduct().getPrice())
                .quantity(item.getQuantity())
                .imageUrl(imageUrl)
                .stock(item.getProduct().getStock())
                .build();
    }
}
