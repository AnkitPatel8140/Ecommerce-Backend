package com.ankit.dreamshops.repository;

import com.ankit.dreamshops.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, Long> {
}
