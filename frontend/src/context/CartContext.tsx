import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { cartApi, getErrorMessage, orderApi } from '../lib/api'
import type { CartDto, OrderDto } from '../types/api'
import { useAuth } from './AuthContext'
import { useToast } from './ToastContext'

interface CartContextValue {
  cart: CartDto | null
  itemCount: number
  isDrawerOpen: boolean
  busy: boolean
  openDrawer: () => void
  closeDrawer: () => void
  refreshCart: () => Promise<void>
  addToCart: (productId: number, quantity?: number) => Promise<void>
  updateQuantity: (itemId: number, quantity: number) => Promise<void>
  removeItem: (itemId: number) => Promise<void>
  clearCart: () => Promise<void>
  placeOrder: () => Promise<OrderDto | null>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user, userId, isAuthenticated, refreshUser } = useAuth()
  const { showToast } = useToast()
  const [cart, setCart] = useState<CartDto | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }
    setCart(user?.cart ?? null)
  }, [isAuthenticated, user])

  const refreshCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null)
      return
    }
    const updatedUser = await refreshUser()
    const cId = updatedUser?.cart?.cartId
    if (cId) {
      try {
        const freshCart = await cartApi.getMyCart(cId)
        setCart(freshCart)
      } catch {
        setCart(updatedUser?.cart ?? null)
      }
    } else {
      setCart(null)
    }
  }, [isAuthenticated, refreshUser])

  const addToCart = useCallback(
    async (productId: number, quantity = 1) => {
      if (!isAuthenticated) {
        showToast('Please sign in to add pieces to your bag.', 'info')
        return
      }
      setBusy(true)
      try {
        await cartApi.addItem(productId, quantity)
        await refreshCart()
        showToast('Added to your bag.', 'success')
        setIsDrawerOpen(true)
      } catch (err) {
        showToast(getErrorMessage(err), 'error')
      } finally {
        setBusy(false)
      }
    },
    [isAuthenticated, refreshCart, showToast]
  )

  const updateQuantity = useCallback(
    async (itemId: number, quantity: number) => {
      if (!cart?.cartId) return
      if (quantity <= 0) {
        setBusy(true)
        try {
          await cartApi.removeItem(cart.cartId, itemId)
          await refreshCart()
        } catch (err) {
          showToast(getErrorMessage(err), 'error')
        } finally {
          setBusy(false)
        }
        return
      }
      setBusy(true)
      try {
        await cartApi.updateItemQuantity(cart.cartId, itemId, quantity)
        await refreshCart()
      } catch (err) {
        showToast(getErrorMessage(err), 'error')
      } finally {
        setBusy(false)
      }
    },
    [cart?.cartId, refreshCart, showToast]
  )

  const removeItem = useCallback(
    async (itemId: number) => {
      if (!cart?.cartId) return
      setBusy(true)
      try {
        await cartApi.removeItem(cart.cartId, itemId)
        await refreshCart()
        showToast('Removed from bag.', 'info')
      } catch (err) {
        showToast(getErrorMessage(err), 'error')
      } finally {
        setBusy(false)
      }
    },
    [cart?.cartId, refreshCart, showToast]
  )

  const clearCart = useCallback(async () => {
    if (!cart?.cartId) return
    setBusy(true)
    try {
      await cartApi.clearCart(cart.cartId)
      await refreshCart()
      showToast('Bag cleared.', 'info')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setBusy(false)
    }
  }, [cart?.cartId, refreshCart, showToast])

  const placeOrder = useCallback(async (): Promise<OrderDto | null> => {
    if (!userId) return null
    setBusy(true)
    try {
      const order = await orderApi.placeOrder(userId)
      await refreshCart()
      setIsDrawerOpen(false)
      showToast(`Order #${order.id} confirmed.`, 'success')
      return order
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
      return null
    } finally {
      setBusy(false)
    }
  }, [userId, refreshCart, showToast])

  const itemCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        isDrawerOpen,
        busy,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
        refreshCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        placeOrder,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
