import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Minus, Plus, ShoppingCart, Shield, Truck } from 'lucide-react'
import { formatPrice, getErrorMessage, getImageUrl, productApi } from '../lib/api'
import type { ProductDto } from '../types/api'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<ProductDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIdx, setActiveImageIdx] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const { addToCart, busy } = useCart()
  const { showToast } = useToast()

  useEffect(() => {
    let active = true
    async function load() {
      if (!id) return
      setLoading(true)
      try {
        const data = await productApi.getById(Number(id))
        if (active) {
          setProduct(data)
          setActiveImageIdx(0)
          setQuantity(1)
        }
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
  }, [id, showToast])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-6 aspect-square rounded-3xl bg-white border border-[#E6E3DC] animate-pulse" />
          <div className="lg:col-span-6 space-y-5">
            <div className="h-6 w-32 bg-white rounded animate-pulse" />
            <div className="h-12 w-3/4 bg-white rounded animate-pulse" />
            <div className="h-24 w-full bg-white rounded animate-pulse" />
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="font-serif-editorial text-4xl text-[#14221C]">Product Not Found</h1>
        <Link
          to="/"
          className="inline-flex items-center gap-2 mt-6 rounded-full bg-[#0D2D23] text-white px-6 py-2.5 text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Store
        </Link>
      </div>
    )
  }

  const images = product.images ?? []
  const activeUrl = getImageUrl(images[activeImageIdx])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-20"
    >
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-xs font-medium text-[#627069] hover:text-[#0D2D23] transition-colors mb-6"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Products</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start bg-white rounded-3xl border border-[#E6E3DC] p-6 sm:p-10">
        {/* Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="aspect-square rounded-2xl bg-[#F4F3EF] overflow-hidden flex items-center justify-center">
            {activeUrl ? (
              <motion.img
                key={activeUrl}
                initial={{ opacity: 0.4, scale: 1.02 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.35 }}
                src={activeUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-8">
                <span className="font-serif-editorial text-6xl font-bold text-[#0D2D23]/25">
                  {product.brand?.slice(0, 2).toUpperCase() || 'DS'}
                </span>
                <p className="text-xs uppercase tracking-[0.2em] text-[#627069] mt-3">No Image Uploaded</p>
              </div>
            )}
          </div>

          {images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {images.map((img, idx) => {
                const thumb = getImageUrl(img)
                return (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      idx === activeImageIdx ? 'border-[#0D2D23]' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {thumb && <img src={thumb} alt={img.fileName} className="w-full h-full object-cover" />}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#7B7266]">
              <span>{product.brand}</span>
              <span>·</span>
              <span className="text-[#0D2D23] font-medium">{product.category?.name}</span>
            </div>
            <h1 className="font-serif-editorial text-3xl sm:text-4xl font-medium text-[#1F1B16] mt-2">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 mt-4">
              <span className="font-mono-code text-2xl font-medium text-[#1F1B16]">{formatPrice(product.price)}</span>
              <span
                className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                  product.inventory > 0 ? 'bg-[#DCE7DF] text-[#0D2D23]' : 'bg-rose-100 text-rose-700'
                }`}
              >
                {product.inventory > 0 ? `${product.inventory} in stock` : 'Out of stock'}
              </span>
            </div>
          </div>

          <p className="text-sm text-[#4E5B55] leading-relaxed border-y border-[#EFECE6] py-5">
            {product.description || 'Quality everyday essentials from DreamShops.'}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <div className="inline-flex items-center rounded-full border border-[#DCD8CF] bg-[#F8F7F4] px-3 py-1.5">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="p-1.5 text-[#627069] hover:text-[#14221C] cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-4 font-mono-code text-sm font-semibold text-[#14221C]">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(Math.max(1, product.inventory), q + 1))}
                className="p-1.5 text-[#627069] hover:text-[#14221C] cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              disabled={busy || product.inventory <= 0}
              onClick={() => void addToCart(product.id, quantity)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-[#0D2D23] hover:bg-[#143D30] text-[#F7F4EE] h-11 px-6 text-sm font-medium transition-colors duration-150 active:scale-[0.98] cursor-pointer disabled:opacity-40"
            >
              <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
              <span>{product.inventory > 0 ? 'Add to cart' : 'Unavailable'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="rounded-2xl bg-[#F8F7F4] border border-[#E6E3DC] p-4 space-y-1">
              <Truck className="w-4 h-4 text-[#0D2D23]" />
              <p className="text-xs font-semibold text-[#14221C]">Free Delivery</p>
              <p className="text-[11px] text-[#627069]">On orders over $49</p>
            </div>
            <div className="rounded-2xl bg-[#F8F7F4] border border-[#E6E3DC] p-4 space-y-1">
              <Shield className="w-4 h-4 text-[#0D2D23]" />
              <p className="text-xs font-semibold text-[#14221C]">30-Day Returns</p>
              <p className="text-[11px] text-[#627069]">Hassle-free guarantee</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
