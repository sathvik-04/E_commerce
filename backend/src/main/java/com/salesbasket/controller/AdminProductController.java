package com.salesbasket.controller;

import com.salesbasket.dto.AddProductRequest;
import com.salesbasket.dto.MessageResponse;
import com.salesbasket.dto.ProductResponse;
import com.salesbasket.service.AdminProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/products")
@RequiredArgsConstructor
public class AdminProductController {

    private final AdminProductService adminProductService;

    @PostMapping
    public ResponseEntity<ProductResponse> addProduct(@Valid @RequestBody AddProductRequest request) {
        ProductResponse response = adminProductService.addProduct(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteProduct(@PathVariable Long id) {
        MessageResponse response = adminProductService.deleteProduct(id);
        return ResponseEntity.ok(response);
    }
}
