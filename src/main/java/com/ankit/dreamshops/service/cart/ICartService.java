package com.ankit.dreamshops.service.cart;

import com.ankit.dreamshops.model.Cart;
import com.ankit.dreamshops.model.User;

import java.math.BigDecimal;

public interface ICartService {
    Cart getCart(Long id);
    void clearCart(Long id);
    BigDecimal getTotalPrice(Long id);

    Cart initializeNewCart(User user);

    Cart getCartByUserId(Long userId);
}
