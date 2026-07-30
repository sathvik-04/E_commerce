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
            if (categoryRepo.count() > 0) {
                log.info("Database already seeded, skipping...");
                return;
            }

            log.info("Seeding database with sample data...");

            // Seed Categories
            Category smartphones = categoryRepo.save(Category.builder().categoryName("Smartphones").build());
            Category smartwatches = categoryRepo.save(Category.builder().categoryName("Smartwatches").build());
            Category headphones = categoryRepo.save(Category.builder().categoryName("Headphones").build());
            Category laptops = categoryRepo.save(Category.builder().categoryName("Laptops").build());

            // Seed Products
            List<Product> products = List.of(
                Product.builder().name("iPhone 15 Pro").description("Apple iPhone 15 Pro with A17 Pro chip, titanium design, and ProRes video.").price(new BigDecimal("999.99")).stock(50).category(smartphones).build(),
                Product.builder().name("Samsung Galaxy S24 Ultra").description("Samsung flagship with 200MP camera, S Pen, and Snapdragon 8 Gen 3.").price(new BigDecimal("1199.99")).stock(35).category(smartphones).build(),
                Product.builder().name("Google Pixel 8 Pro").description("Google's AI-powered flagship with the best camera processing.").price(new BigDecimal("799.99")).stock(40).category(smartphones).build(),
                Product.builder().name("OnePlus 12").description("Flagship killer with Snapdragon 8 Gen 3 and 100W fast charging.").price(new BigDecimal("649.99")).stock(60).category(smartphones).build(),

                Product.builder().name("Apple Watch Series 9").description("The most powerful Apple Watch with the new S9 chip and Double Tap gesture.").price(new BigDecimal("399.99")).stock(45).category(smartwatches).build(),
                Product.builder().name("Samsung Galaxy Watch 6").description("Advanced health monitoring with sleep coaching and body composition.").price(new BigDecimal("299.99")).stock(55).category(smartwatches).build(),
                Product.builder().name("Garmin Fenix 7").description("Premium multisport GPS smartwatch for athletes and adventurers.").price(new BigDecimal("699.99")).stock(25).category(smartwatches).build(),

                Product.builder().name("Sony WH-1000XM5").description("Industry-leading noise canceling headphones with 30hr battery life.").price(new BigDecimal("349.99")).stock(80).category(headphones).build(),
                Product.builder().name("Apple AirPods Pro 2").description("Active Noise Cancellation and Transparency mode with Adaptive Audio.").price(new BigDecimal("249.99")).stock(90).category(headphones).build(),
                Product.builder().name("Bose QuietComfort 45").description("Legendary comfort meets world-class noise cancellation.").price(new BigDecimal("279.99")).stock(70).category(headphones).build(),
                Product.builder().name("Sennheiser Momentum 4").description("60-hour battery with adaptive noise cancellation and premium sound.").price(new BigDecimal("299.99")).stock(40).category(headphones).build(),

                Product.builder().name("MacBook Pro 14\" M3 Pro").description("Apple M3 Pro chip, Liquid Retina XDR display, and up to 22hr battery.").price(new BigDecimal("1999.99")).stock(20).category(laptops).build(),
                Product.builder().name("Dell XPS 15").description("15.6-inch OLED display with Intel Core i9 and NVIDIA RTX 4070.").price(new BigDecimal("1799.99")).stock(15).category(laptops).build(),
                Product.builder().name("Lenovo ThinkPad X1 Carbon").description("Ultra-light business laptop with military-grade durability.").price(new BigDecimal("1499.99")).stock(30).category(laptops).build(),
                Product.builder().name("ASUS ROG Zephyrus G14").description("Gaming powerhouse with AMD Ryzen 9 and RTX 4060, 14-inch OLED.").price(new BigDecimal("1399.99")).stock(18).category(laptops).build()
            );

            List<Product> saved = productRepo.saveAll(products);

            // Add placeholder image URLs
            String[] imageNames = {
                "iphone15pro", "galaxy-s24-ultra", "pixel8pro", "oneplus12",
                "apple-watch-9", "galaxy-watch-6", "garmin-fenix7",
                "sony-wh1000xm5", "airpods-pro2", "bose-qc45", "sennheiser-m4",
                "macbook-pro-m3", "dell-xps15", "thinkpad-x1", "rog-zephyrus-g14"
            };

            for (int i = 0; i < saved.size(); i++) {
                Product p = saved.get(i);
                String imgUrl = "/uploads/" + imageNames[i] + ".jpg";
                ProductImage image = ProductImage.builder()
                        .imageUrl(imgUrl)
                        .product(p)
                        .build();
                p.getImages().add(image);
                productRepo.save(p);
            }

            log.info("Database seeded successfully with {} products and {} categories.",
                    saved.size(), categoryRepo.count());
        };
    }
}
