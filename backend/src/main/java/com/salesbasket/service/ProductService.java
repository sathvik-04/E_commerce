package com.salesbasket.service;

import com.salesbasket.dto.ProductResponse;
import com.salesbasket.entity.Product;
import com.salesbasket.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public Page<ProductResponse> getProducts(Long categoryId, String search, int page, int size, String sortBy, String direction) {
        Sort sort = direction.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<Product> products = productRepository.findByFilters(
                categoryId,
                (search != null && !search.isBlank()) ? search : null,
                pageable
        );

        return products.map(this::toResponse);
    }

    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new jakarta.persistence.EntityNotFoundException("Product not found with id: " + id));
        return toResponse(product);
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse.CategoryDto categoryDto = null;
        if (product.getCategory() != null) {
            categoryDto = ProductResponse.CategoryDto.builder()
                    .categoryId(product.getCategory().getCategoryId())
                    .categoryName(product.getCategory().getCategoryName())
                    .build();
        }

        var images = product.getImages().stream()
                .map(img -> ProductResponse.ImageDto.builder()
                        .imageUrl(img.getImageUrl())
                        .build())
                .toList();

        return ProductResponse.builder()
                .productId(product.getProductId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice())
                .stock(product.getStock())
                .category(categoryDto)
                .images(images)
                .build();
    }
}
