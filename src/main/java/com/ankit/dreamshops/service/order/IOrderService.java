package com.ankit.dreamshops.service.order;

import com.ankit.dreamshops.model.Order;

public interface IOrderService {
    Order placeOrder(Long userId);
    Order getOrder(Long orderId);
}
