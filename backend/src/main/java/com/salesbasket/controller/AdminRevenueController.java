package com.salesbasket.controller;

import com.salesbasket.dto.RevenueResponse;
import com.salesbasket.service.RevenueService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/admin/revenue")
@RequiredArgsConstructor
public class AdminRevenueController {

    private final RevenueService revenueService;

    @GetMapping("/daily")
    public ResponseEntity<RevenueResponse> getDailyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        RevenueResponse response = revenueService.getDailyRevenue(date);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/monthly")
    public ResponseEntity<RevenueResponse> getMonthlyRevenue(
            @RequestParam int year,
            @RequestParam int month) {
        RevenueResponse response = revenueService.getMonthlyRevenue(year, month);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/yearly")
    public ResponseEntity<RevenueResponse> getYearlyRevenue(@RequestParam int year) {
        RevenueResponse response = revenueService.getYearlyRevenue(year);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/overall")
    public ResponseEntity<RevenueResponse> getOverallRevenue() {
        RevenueResponse response = revenueService.getOverallRevenue();
        return ResponseEntity.ok(response);
    }
}
