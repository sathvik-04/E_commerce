package com.salesbasket.service;

import com.salesbasket.dto.PaymentOrderResponse;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
@Slf4j
public class RazorpayService {

    @Value("${razorpay.key.id}")
    private String keyId;

    @Value("${razorpay.key.secret}")
    private String keySecret;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    public PaymentOrderResponse createOrder(BigDecimal amountInRupees) {
        try {
            int amountInPaise = amountInRupees.multiply(BigDecimal.valueOf(100)).intValue();

            JSONObject body = new JSONObject();
            body.put("amount", amountInPaise);
            body.put("currency", "INR");
            body.put("receipt", "rcpt_" + System.currentTimeMillis());

            String cleanKeyId = keyId != null ? keyId.trim() : "";
            String cleanKeySecret = keySecret != null ? keySecret.trim() : "";

            String auth = cleanKeyId + ":" + cleanKeySecret;
            String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes(StandardCharsets.UTF_8));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.razorpay.com/v1/orders"))
                    .header("Authorization", "Basic " + encodedAuth)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(body.toString()))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() != 200 && response.statusCode() != 201) {
                log.error("Razorpay order creation failed. Status: {}, Body: {}", response.statusCode(), response.body());
                throw new RuntimeException("Razorpay API error (" + response.statusCode() + "): " + response.body());
            }

            JSONObject jsonResponse = new JSONObject(response.body());
            String orderId = jsonResponse.getString("id");
            log.info("Razorpay order created successfully: {}", orderId);

            return PaymentOrderResponse.builder()
                    .orderId(orderId)
                    .amount(amountInRupees)
                    .currency("INR")
                    .keyId(cleanKeyId)
                    .build();

        } catch (Exception e) {
            log.error("Error creating Razorpay order: {}", e.getMessage(), e);
            throw new RuntimeException(e.getMessage());
        }
    }

    public boolean verifyPayment(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            String cleanOrderId = razorpayOrderId != null ? razorpayOrderId.trim() : "";
            String cleanPaymentId = razorpayPaymentId != null ? razorpayPaymentId.trim() : "";
            String cleanSignature = razorpaySignature != null ? razorpaySignature.trim() : "";
            String cleanKeySecret = keySecret != null ? keySecret.trim() : "";

            String data = cleanOrderId + "|" + cleanPaymentId;
            SecretKeySpec secretKeySpec = new SecretKeySpec(cleanKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(secretKeySpec);
            byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

            StringBuilder hexString = new StringBuilder();
            for (byte b : hash) {
                String hex = Integer.toHexString(0xff & b);
                if (hex.length() == 1) hexString.append('0');
                hexString.append(hex);
            }

            String generatedSignature = hexString.toString();
            boolean valid = generatedSignature.equalsIgnoreCase(cleanSignature);
            log.info("Razorpay signature verification: valid={} (generated={}, received={})", valid, generatedSignature, cleanSignature);
            return valid;
        } catch (Exception e) {
            log.error("Error verifying Razorpay signature: {}", e.getMessage(), e);
            return false;
        }
    }
}
