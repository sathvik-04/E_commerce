package com.salesbasket.repository;

import com.salesbasket.entity.Order;
import com.salesbasket.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByUserOrderByCreatedAtDesc(User user);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.status IN (com.salesbasket.entity.Order.OrderStatus.PAID, " +
           "com.salesbasket.entity.Order.OrderStatus.SHIPPED, " +
           "com.salesbasket.entity.Order.OrderStatus.DELIVERED) " +
           "AND o.createdAt >= :start AND o.createdAt < :end")
    BigDecimal calculateRevenueByDateRange(@Param("start") LocalDateTime start,
                                           @Param("end") LocalDateTime end);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o " +
           "WHERE o.status IN (com.salesbasket.entity.Order.OrderStatus.PAID, " +
           "com.salesbasket.entity.Order.OrderStatus.SHIPPED, " +
           "com.salesbasket.entity.Order.OrderStatus.DELIVERED)")
    BigDecimal calculateTotalRevenue();
}
