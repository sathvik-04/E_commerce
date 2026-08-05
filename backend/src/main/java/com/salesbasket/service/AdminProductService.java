package com.salesbasket.service;

import com.salesbasket.dto.AddProductRequest;
import com.salesbasket.dto.MessageResponse;
import com.salesbasket.dto.ProductResponse;
import com.salesbasket.entity.Category;
import com.salesbasket.entity.Product;
import com.salesbasket.entity.ProductImage;
import com.salesbasket.exception.DuplicateProductException;
import com.salesbasket.exception.InvalidCategoryException;
import com.salesbasket.exception.ResourceNotFoundException;
import com.salesbasket.repository.CategoryRepository;
import com.salesbasket.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AdminProductService {

    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    @Transactional
    public ProductResponse addProduct(AddProductRequest request) {
        // Validate category exists
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new InvalidCategoryException(
                        "Category not found with id: " + request.getCategoryId()));

        // Check for duplicate product name
        if (productRepository.existsByNameIgnoreCase(request.getName())) {
            throw new DuplicateProductException(
                    "Product already exists with name: " + request.getName());
        }

        Product product = Product.builder()
                .name(request.getName())
                .description(request.getDescription())
                .price(request.getPrice())
                .stock(request.getStock())
                .category(category)
                .build();

        if (request.getImageUrl() != null && !request.getImageUrl().trim().isEmpty()) {
            ProductImage image = ProductImage.builder()
                    .imageUrl(request.getImageUrl().trim())
                    .product(product)
                    .build();
            product.getImages().add(image);
        }

        Product savedProduct = productRepository.save(product);
        log.info("Admin added product: {} (ID: {})", savedProduct.getName(), savedProduct.getProductId());

        return toResponse(savedProduct);
    }

    @Transactional
    public MessageResponse deleteProduct(Long productId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product not found with id: " + productId));

        productRepository.delete(product);
        log.info("Admin deleted product: {} (ID: {})", product.getName(), productId);

        return new MessageResponse("Product deleted successfully");
    }

    private ProductResponse toResponse(Product product) {
        ProductResponse.CategoryDto categoryDto = null;
        if (product.getCategory() != null) {
            categoryDto = ProductResponse.CategoryDto.builder()
                    .categoryId(product.getCategory().getCategoryId())
                    .categoryName(product.getCategory().getCategoryName())
                    .build();
        }

        var images = product.getImages() != null
                ? product.getImages().stream()
                    .map(img -> ProductResponse.ImageDto.builder()
                            .imageUrl(img.getImageUrl())
                            .build())
                    .toList()
                : java.util.List.<ProductResponse.ImageDto>of();

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
