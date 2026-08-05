package com.salesbasket.controller;

import com.salesbasket.dto.MessageResponse;
import com.salesbasket.entity.Invoice;
import com.salesbasket.service.InvoiceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {

    private final InvoiceService invoiceService;

    @PostMapping("/{orderId}/generate")
    public ResponseEntity<MessageResponse> generateInvoice(@PathVariable Long orderId) {
        Invoice invoice = invoiceService.generateInvoice(orderId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new MessageResponse("Invoice generated successfully. Invoice Number: " + invoice.getInvoiceNumber()));
    }

    @GetMapping("/{orderId}/download")
    public ResponseEntity<byte[]> downloadInvoice(@PathVariable Long orderId) {
        byte[] pdfBytes = invoiceService.getInvoicePdf(orderId);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "invoice-order-" + orderId + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
