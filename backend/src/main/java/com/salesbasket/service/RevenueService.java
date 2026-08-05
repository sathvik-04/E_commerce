package com.salesbasket.service;

import com.salesbasket.dto.RevenueResponse;
import com.salesbasket.repository.OrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class RevenueService {

    private final OrderRepository orderRepository;

    public RevenueResponse getDailyRevenue(LocalDate date) {
        LocalDateTime start = date.atStartOfDay();
        LocalDateTime end = date.plusDays(1).atStartOfDay();

        BigDecimal revenue = orderRepository.calculateRevenueByDateRange(start, end);
        String period = "Daily: " + date;

        if (revenue.compareTo(BigDecimal.ZERO) == 0) {
            return RevenueResponse.builder()
                    .period(period)
                    .revenue(BigDecimal.ZERO)
                    .message("No revenue data available for " + date)
                    .build();
        }

        return RevenueResponse.builder()
                .period(period)
                .revenue(revenue)
                .message("Daily revenue retrieved successfully")
                .build();
    }

    public RevenueResponse getMonthlyRevenue(int year, int month) {
        LocalDateTime start = LocalDate.of(year, month, 1).atStartOfDay();
        LocalDateTime end = start.plusMonths(1);

        BigDecimal revenue = orderRepository.calculateRevenueByDateRange(start, end);
        String period = "Monthly: " + year + "-" + String.format("%02d", month);

        if (revenue.compareTo(BigDecimal.ZERO) == 0) {
            return RevenueResponse.builder()
                    .period(period)
                    .revenue(BigDecimal.ZERO)
                    .message("No revenue data available for " + period)
                    .build();
        }

        return RevenueResponse.builder()
                .period(period)
                .revenue(revenue)
                .message("Monthly revenue retrieved successfully")
                .build();
    }

    public RevenueResponse getYearlyRevenue(int year) {
        LocalDateTime start = LocalDate.of(year, 1, 1).atStartOfDay();
        LocalDateTime end = LocalDate.of(year + 1, 1, 1).atStartOfDay();

        BigDecimal revenue = orderRepository.calculateRevenueByDateRange(start, end);
        String period = "Yearly: " + year;

        if (revenue.compareTo(BigDecimal.ZERO) == 0) {
            return RevenueResponse.builder()
                    .period(period)
                    .revenue(BigDecimal.ZERO)
                    .message("No revenue data available for year " + year)
                    .build();
        }

        return RevenueResponse.builder()
                .period(period)
                .revenue(revenue)
                .message("Yearly revenue retrieved successfully")
                .build();
    }

    public RevenueResponse getOverallRevenue() {
        BigDecimal revenue = orderRepository.calculateTotalRevenue();

        if (revenue.compareTo(BigDecimal.ZERO) == 0) {
            return RevenueResponse.builder()
                    .period("Overall")
                    .revenue(BigDecimal.ZERO)
                    .message("No revenue data available")
                    .build();
        }

        return RevenueResponse.builder()
                .period("Overall")
                .revenue(revenue)
                .message("Overall revenue retrieved successfully")
                .build();
    }
}
