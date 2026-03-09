package com.ankit.dreamshops.service.order;

import com.ankit.dreamshops.DTO.OrderDto;
import com.ankit.dreamshops.model.Order;

import java.util.List;

public interface IOrderService {
    Order placeOrder(Long userId);
    OrderDto getOrder(Long orderId);

    List<OrderDto> getUserOrders(Long userId);
}
