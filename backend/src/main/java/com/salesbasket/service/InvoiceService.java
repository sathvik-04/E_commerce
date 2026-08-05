package com.salesbasket.service;

import com.salesbasket.entity.Invoice;
import com.salesbasket.entity.Order;
import com.salesbasket.entity.OrderItem;
import com.salesbasket.exception.ResourceNotFoundException;
import com.salesbasket.repository.InvoiceRepository;
import com.salesbasket.repository.OrderRepository;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;

    private static final String INVOICE_DIR = "invoices";

    @Transactional
    public Invoice generateInvoice(Long orderId) {
        // Check if invoice already exists for this order
        var existingInvoice = invoiceRepository.findByOrderId(orderId);
        if (existingInvoice.isPresent()) {
            log.info("Invoice already exists for order ID: {}", orderId);
            return existingInvoice.get();
        }

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));

        // Only generate invoices for paid orders
        if (order.getStatus() != Order.OrderStatus.PAID
                && order.getStatus() != Order.OrderStatus.SHIPPED
                && order.getStatus() != Order.OrderStatus.DELIVERED) {
            throw new IllegalArgumentException(
                    "Invoice can only be generated for completed orders. Current status: " + order.getStatus());
        }

        try {
            // Ensure invoices directory exists
            Path invoiceDir = Paths.get(INVOICE_DIR);
            if (!Files.exists(invoiceDir)) {
                Files.createDirectories(invoiceDir);
            }

            String invoiceNumber = "INV-" + order.getId() + "-" + System.currentTimeMillis();
            String fileName = invoiceNumber + ".pdf";
            Path filePath = invoiceDir.resolve(fileName);

            generatePdf(order, invoiceNumber, filePath);

            Invoice invoice = Invoice.builder()
                    .invoiceNumber(invoiceNumber)
                    .order(order)
                    .filePath(filePath.toString())
                    .build();

            Invoice savedInvoice = invoiceRepository.save(invoice);
            log.info("Generated invoice {} for order ID: {}", invoiceNumber, orderId);

            return savedInvoice;
        } catch (IOException e) {
            log.error("Failed to generate invoice PDF for order ID: {}", orderId, e);
            throw new RuntimeException("Failed to generate invoice: " + e.getMessage());
        }
    }

    public byte[] getInvoicePdf(Long orderId) {
        Invoice invoice = invoiceRepository.findByOrderId(orderId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Invoice not found for order id: " + orderId + ". Please generate the invoice first."));

        try {
            Path filePath = Paths.get(invoice.getFilePath());
            if (!Files.exists(filePath)) {
                throw new ResourceNotFoundException("Invoice file not found on disk. Please regenerate the invoice.");
            }
            return Files.readAllBytes(filePath);
        } catch (IOException e) {
            log.error("Failed to read invoice file for order ID: {}", orderId, e);
            throw new RuntimeException("Failed to read invoice file: " + e.getMessage());
        }
    }

    private void generatePdf(Order order, String invoiceNumber, Path filePath) throws IOException {
        PdfWriter writer = new PdfWriter(filePath.toString());
        PdfDocument pdfDocument = new PdfDocument(writer);
        Document document = new Document(pdfDocument);

        try {
            // Header
            DeviceRgb headerColor = new DeviceRgb(41, 128, 185);

            Paragraph title = new Paragraph("INVOICE")
                    .setFontSize(28)
                    .setBold()
                    .setFontColor(headerColor)
                    .setTextAlignment(TextAlignment.CENTER);
            document.add(title);

            Paragraph storeName = new Paragraph("SalesBasket E-Commerce")
                    .setFontSize(14)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.GRAY);
            document.add(storeName);

            document.add(new Paragraph("\n"));

            // Invoice details
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd-MM-yyyy HH:mm:ss");
            document.add(new Paragraph("Invoice Number: " + invoiceNumber)
                    .setFontSize(11).setBold());
            document.add(new Paragraph("Order ID: #" + order.getId())
                    .setFontSize(11));
            document.add(new Paragraph("Date: " + order.getCreatedAt().format(formatter))
                    .setFontSize(11));
            document.add(new Paragraph("Payment ID: " +
                    (order.getRazorpayPaymentId() != null ? order.getRazorpayPaymentId() : "N/A"))
                    .setFontSize(11));
            document.add(new Paragraph("Status: " + order.getStatus().name())
                    .setFontSize(11));

            // Customer details
            document.add(new Paragraph("\n"));
            document.add(new Paragraph("Bill To:")
                    .setFontSize(12).setBold().setFontColor(headerColor));
            document.add(new Paragraph("Customer: " + order.getUser().getUsername())
                    .setFontSize(11));
            document.add(new Paragraph("Email: " + order.getUser().getEmail())
                    .setFontSize(11));

            document.add(new Paragraph("\n"));

            // Items table
            float[] columnWidths = {1, 4, 1, 2, 2};
            Table table = new Table(UnitValue.createPercentArray(columnWidths))
                    .useAllAvailableWidth();

            // Table header
            DeviceRgb tableHeaderBg = new DeviceRgb(52, 73, 94);
            String[] headers = {"#", "Product", "Qty", "Price (₹)", "Subtotal (₹)"};
            for (String header : headers) {
                Cell cell = new Cell()
                        .add(new Paragraph(header).setBold().setFontColor(ColorConstants.WHITE))
                        .setBackgroundColor(tableHeaderBg)
                        .setTextAlignment(TextAlignment.CENTER);
                table.addHeaderCell(cell);
            }

            // Table rows
            int index = 1;
            for (OrderItem item : order.getItems()) {
                BigDecimal subtotal = item.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));

                DeviceRgb rowBg = index % 2 == 0
                        ? new DeviceRgb(245, 245, 245)
                        : ColorConstants.WHITE instanceof DeviceRgb
                                ? (DeviceRgb) ColorConstants.WHITE
                                : new DeviceRgb(255, 255, 255);

                table.addCell(new Cell().add(new Paragraph(String.valueOf(index)))
                        .setBackgroundColor(rowBg).setTextAlignment(TextAlignment.CENTER));
                table.addCell(new Cell().add(new Paragraph(item.getProduct().getName()))
                        .setBackgroundColor(rowBg));
                table.addCell(new Cell().add(new Paragraph(String.valueOf(item.getQuantity())))
                        .setBackgroundColor(rowBg).setTextAlignment(TextAlignment.CENTER));
                table.addCell(new Cell().add(new Paragraph("₹" + item.getPrice().toPlainString()))
                        .setBackgroundColor(rowBg).setTextAlignment(TextAlignment.RIGHT));
                table.addCell(new Cell().add(new Paragraph("₹" + subtotal.toPlainString()))
                        .setBackgroundColor(rowBg).setTextAlignment(TextAlignment.RIGHT));

                index++;
            }

            document.add(table);

            document.add(new Paragraph("\n"));

            // Total
            Paragraph totalParagraph = new Paragraph("Total Amount: ₹" + order.getTotalAmount().toPlainString())
                    .setFontSize(16)
                    .setBold()
                    .setFontColor(headerColor)
                    .setTextAlignment(TextAlignment.RIGHT);
            document.add(totalParagraph);

            document.add(new Paragraph("\n\n"));

            // Footer
            Paragraph footer = new Paragraph("Thank you for shopping with SalesBasket!")
                    .setFontSize(12)
                    .setItalic()
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.GRAY);
            document.add(footer);

            Paragraph generated = new Paragraph("Generated on: " + LocalDateTime.now().format(formatter))
                    .setFontSize(9)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setFontColor(ColorConstants.LIGHT_GRAY);
            document.add(generated);

        } finally {
            document.close();
        }
    }
}
