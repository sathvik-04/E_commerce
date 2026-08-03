package com.salesbasket.config;

import com.salesbasket.entity.Category;
import com.salesbasket.entity.Product;
import com.salesbasket.entity.ProductImage;
import com.salesbasket.repository.CategoryRepository;
import com.salesbasket.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    @Bean
    CommandLineRunner seedDatabase(CategoryRepository categoryRepo, ProductRepository productRepo) {
        return args -> {
            // 1. If database has no categories, seed full default catalog
            if (categoryRepo.count() == 0) {
                log.info("Seeding database with default categories and products...");

                Category smartphones = categoryRepo.save(Category.builder().categoryName("Smartphones").build());
                Category smartwatches = categoryRepo.save(Category.builder().categoryName("Smartwatches").build());
                Category headphones = categoryRepo.save(Category.builder().categoryName("Headphones").build());
                Category laptops = categoryRepo.save(Category.builder().categoryName("Laptops").build());

                List<Product> products = List.of(
                    Product.builder().name("iPhone 15 Pro").description("Apple iPhone 15 Pro with A17 Pro chip and titanium design.").price(new BigDecimal("99999.00")).stock(50).category(smartphones).build(),
                    Product.builder().name("Samsung Galaxy S24 Ultra").description("Samsung flagship with 200MP camera and S Pen.").price(new BigDecimal("119999.00")).stock(35).category(smartphones).build(),
                    Product.builder().name("Google Pixel 8 Pro").description("Google's AI-powered flagship with advanced camera processing.").price(new BigDecimal("79999.00")).stock(40).category(smartphones).build(),
                    Product.builder().name("OnePlus 12").description("Flagship killer with Snapdragon 8 Gen 3.").price(new BigDecimal("64999.00")).stock(60).category(smartphones).build(),

                    Product.builder().name("Apple Watch Series 9").description("Apple Watch with S9 chip and Double Tap gesture.").price(new BigDecimal("39999.00")).stock(45).category(smartwatches).build(),
                    Product.builder().name("Samsung Galaxy Watch 6").description("Advanced health monitoring with sleep coaching.").price(new BigDecimal("29999.00")).stock(55).category(smartwatches).build(),
                    Product.builder().name("Garmin Fenix 7").description("Multisport GPS smartwatch for outdoor navigation.").price(new BigDecimal("69999.00")).stock(25).category(smartwatches).build(),

                    Product.builder().name("Sony WH-1000XM5").description("Industry-leading noise canceling headphones.").price(new BigDecimal("29999.00")).stock(80).category(headphones).build(),
                    Product.builder().name("Apple AirPods Pro 2").description("Active Noise Cancellation with Adaptive Audio.").price(new BigDecimal("24999.00")).stock(90).category(headphones).build(),
                    Product.builder().name("Bose QuietComfort 45").description("World-class noise cancellation and comfort.").price(new BigDecimal("27999.00")).stock(70).category(headphones).build(),

                    Product.builder().name("MacBook Pro 14\" M3 Pro").description("Apple M3 Pro chip with Liquid Retina XDR display.").price(new BigDecimal("199999.00")).stock(20).category(laptops).build(),
                    Product.builder().name("Dell XPS 15").description("OLED display with Intel Core i9 and RTX graphics.").price(new BigDecimal("179999.00")).stock(15).category(laptops).build()
                );

                productRepo.saveAll(products);
            }

            // 2. Ensure ALL existing products in DB have valid image URLs
            List<Product> allProducts = productRepo.findAll();
            for (Product p : allProducts) {
                if (p.getImages() == null || p.getImages().isEmpty()) {
                    String url = getUnsplashUrl(p.getName(), p.getCategory() != null ? p.getCategory().getCategoryName() : "");
                    ProductImage image = ProductImage.builder()
                            .imageUrl(url)
                            .product(p)
                            .build();
                    p.getImages().add(image);
                    productRepo.save(p);
                    log.info("Assigned image to product #{}: {}", p.getProductId(), p.getName());
                }
            }
        };
    }

    private String getUnsplashUrl(String productName, String categoryName) {
        String name = productName != null ? productName.toLowerCase() : "";
        String cat = categoryName != null ? categoryName.toLowerCase() : "";

        if (name.contains("iphone") || (cat.contains("smartphone") && name.contains("apple"))) {
            return "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500&h=400&fit=crop&q=80";
        }
        if (name.contains("samsung") || name.contains("galaxy s")) {
            return "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=500&h=400&fit=crop&q=80";
        }
        if (name.contains("pixel")) {
            return "https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=500&h=400&fit=crop&q=80";
        }
        if (cat.contains("smartphone") || name.contains("phone")) {
            return "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=400&fit=crop&q=80";
        }
        if (cat.contains("watch") || name.contains("watch")) {
            return "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&h=400&fit=crop&q=80";
        }
        if (cat.contains("headphone") || cat.contains("audio") || name.contains("sony") || name.contains("airpods")) {
            return "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop&q=80";
        }
        if (cat.contains("laptop") || name.contains("macbook") || name.contains("book") || name.contains("dell")) {
            return "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=500&h=400&fit=crop&q=80";
        }

        return "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?w=500&h=400&fit=crop&q=80";
    }
}
