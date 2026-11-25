import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus, ShoppingBag, Trash2, X, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useAuth } from '../../context/AuthContext'
import { formatPrice, getImageUrl } from '../../lib/api'

export function CartDrawer() {
  const { cart, isDrawerOpen, closeDrawer, updateQuantity, removeItem, clearCart, placeOrder, busy } = useCart()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const items = cart?.items ?? []

  const handleCheckout = async () => {
    const order = await placeOrder()
    if (order) {
      navigate('/orders')
    }
  }

  return (
    <AnimatePresence>
      {isDrawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            onClick={closeDrawer}
            className="fixed inset-0 z-[70] bg-[#1F1B16]/35"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed top-0 right-0 bottom-0 z-[80] w-full max-w-md bg-[#FDFBF7] border-l border-[#1F1B16]/10 flex flex-col shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
          >
            <div className="px-6 py-5 border-b border-[#1F1B16]/8 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#7B7266]">Your selection</p>
                <h2 className="font-serif-editorial text-2xl font-medium text-[#1F1B16] mt-0.5">Shopping cart</h2>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="p-2 rounded-lg border border-[#1F1B16]/12 text-[#7B7266] hover:text-[#1F1B16] transition-colors duration-150 cursor-pointer"
                aria-label="Close cart"
              >
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 bg-[#F7F4EE]">
              {!isAuthenticated ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <ShoppingBag className="w-8 h-8 text-[#7B7266] mb-3" strokeWidth={1.5} />
                  <p className="font-serif-editorial text-2xl text-[#1F1B16]">Sign in to view your cart</p>
                  <p className="text-sm text-[#5E554A] mt-2 max-w-xs leading-relaxed">
                    Your cart syncs with your DreamShops account for checkout.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      closeDrawer()
                      navigate('/auth')
                    }}
                    className="mt-6 rounded-lg bg-[#0D2D23] hover:bg-[#143D30] text-[#F7F4EE] px-6 py-2.5 text-sm font-medium transition-colors duration-150 cursor-pointer"
                  >
                    Sign in
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-16">
                  <ShoppingBag className="w-8 h-8 text-[#7B7266] mb-3" strokeWidth={1.5} />
                  <p className="font-serif-editorial text-2xl text-[#1F1B16]">Your cart is empty</p>
                  <p className="text-sm text-[#5E554A] mt-2 max-w-xs">
                    Browse the catalog and add products to start your order.
                  </p>
                </div>
              ) : (
                items.map((item) => {
                  const thumb = getImageUrl(item.product?.images?.[0])
                  return (
                    <div
                      key={item.itemId}
                      className="flex gap-4 p-4 rounded-2xl border border-[#1F1B16]/8 bg-[#FDFBF7]"
                    >
                      <div className="w-20 h-20 rounded-xl bg-[#EFE9DF]/65 overflow-hidden shrink-0 flex items-center justify-center">
                        {thumb ? (
                          <img src={thumb} alt={item.product.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="font-serif-editorial text-lg text-[#1F1B16]/35">
                            {item.product?.name?.slice(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-xs text-[#7B7266]">{item.product?.brand}</p>
                            <h3 className="text-sm font-medium text-[#1F1B16] truncate">{item.product?.name}</h3>
                          </div>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => void removeItem(item.itemId)}
                            className="text-[#7B7266] hover:text-[#C94A35] transition-colors duration-150 cursor-pointer"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="inline-flex items-center rounded-lg border border-[#1F1B16]/12 bg-[#F7F4EE] px-1 py-0.5">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void updateQuantity(item.itemId, item.quantity - 1)}
                              className="p-1 text-[#7B7266] hover:text-[#1F1B16] cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                            <span className="px-2.5 text-xs font-mono-code text-[#1F1B16]">{item.quantity}</span>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => void updateQuantity(item.itemId, item.quantity + 1)}
                              className="p-1 text-[#7B7266] hover:text-[#1F1B16] cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                            </button>
                          </div>

                          <span className="font-mono-code text-sm font-medium text-[#1F1B16]">
                            {formatPrice(item.unitPrice * item.quantity)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {isAuthenticated && items.length > 0 && (
              <div className="p-6 border-t border-[#1F1B16]/8 bg-[#FDFBF7] space-y-4">
                <div className="flex items-center justify-between text-sm text-[#5E554A]">
                  <span>Subtotal</span>
                  <span className="font-mono-code text-lg font-medium text-[#1F1B16]">
                    {formatPrice(cart?.totalAmount)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => void clearCart()}
                    className="px-4 py-2.5 rounded-lg border border-[#1F1B16]/15 text-sm font-medium text-[#5E554A] hover:text-[#1F1B16] transition-colors duration-150 cursor-pointer"
                  >
                    Clear
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleCheckout()}
                    disabled={busy}
                    className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#0D2D23] hover:bg-[#143D30] text-[#F7F4EE] py-2.5 px-5 text-sm font-medium transition-colors duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-50"
                  >
                    <span>{busy ? 'Processing...' : 'Place order'}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
