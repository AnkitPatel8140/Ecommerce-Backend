import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, Clock, User as UserIcon, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { formatPrice, getErrorMessage, orderApi } from '../lib/api'
import type { OrderDto } from '../types/api'

export function OrdersPage() {
  const { user, userId, isAuthenticated, isAdmin } = useAuth()
  const { showToast } = useToast()
  const [orders, setOrders] = useState<OrderDto[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function load() {
      if (!userId) {
        setLoading(false)
        return
      }
      try {
        const list = await orderApi.getUserOrders(userId)
        if (active) setOrders(list)
      } catch (err) {
        if (active) showToast(getErrorMessage(err), 'error')
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => {
      active = false
    }
  }, [userId, showToast])

  if (!isAuthenticated) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif-editorial text-4xl text-[#14221C]">Sign in to view your orders</h1>
        <Link
          to="/auth"
          className="inline-flex items-center gap-2 mt-6 rounded-full bg-[#0D2D23] text-white px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
        >
          <span>Sign In</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 pb-20 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[#E6E3DC] bg-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#DCE7DF] flex items-center justify-center text-[#0D2D23]">
            <UserIcon className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-[#7B7266]">
              {isAdmin ? 'Administrator' : 'Customer account'}
            </p>
            <h1 className="font-serif-editorial text-3xl font-medium text-[#1F1B16]">
              {user?.firstName} {user?.lastName}
            </h1>
            <p className="font-mono-code text-xs text-[#7B7266]">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="rounded-full bg-[#0D2D23] text-white px-5 py-2.5 text-xs font-semibold"
            >
              Admin Studio
            </Link>
          )}
          <Link
            to="/"
            className="rounded-full border border-[#E6E3DC] hover:border-[#0D2D23] px-5 py-2.5 text-xs font-semibold text-[#14221C]"
          >
            Continue Shopping
          </Link>
        </div>
      </motion.div>

      <section className="space-y-4">
        <h2 className="font-serif-editorial text-3xl font-bold text-[#14221C]">Your Orders</h2>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white border border-[#E6E3DC] animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#D3CFC5] bg-white p-12 text-center">
            <Package className="w-10 h-10 text-[#627069]/40 mx-auto mb-3" />
            <p className="font-serif-editorial text-2xl text-[#14221C]">No orders placed yet</p>
            <p className="text-xs text-[#627069] mt-1">Add products to your cart and place an order.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, idx) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="rounded-2xl border border-[#E6E3DC] bg-white p-6 space-y-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#EFECE6]">
                  <div className="flex items-center gap-4">
                    <span className="font-mono-code text-sm font-semibold text-[#0D2D23]">ORDER #{order.id}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-[#627069]">
                      <Clock className="w-3.5 h-3.5" />
                      {order.orderDate ? new Date(order.orderDate).toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-[#DCE7DF] px-3 py-1 text-[11px] font-semibold text-[#0D2D23]">
                      {order.status}
                    </span>
                    <span className="font-mono-code text-base font-bold text-[#14221C]">
                      {formatPrice(order.totalAmount)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {order.items?.map((item, i) => (
                    <div
                      key={`${order.id}-${item.productId}-${i}`}
                      className="rounded-xl border border-[#EFECE6] bg-[#F8F7F4] px-4 py-3 flex items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] uppercase tracking-wider text-[#627069]">{item.productBrand}</p>
                        <p className="text-sm font-medium text-[#14221C] truncate">{item.productName}</p>
                        <p className="font-mono-code text-[11px] text-[#627069]">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-mono-code text-xs font-semibold text-[#0D2D23] shrink-0">
                        {formatPrice(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
