import { Link } from 'react-router-dom'
import { ArrowUpRight, ShoppingCart } from 'lucide-react'
import type { ProductDto } from '../../types/api'
import { formatPrice, getImageUrl } from '../../lib/api'
import { useCart } from '../../context/CartContext'

interface ProductCardProps {
  product: ProductDto
}

const DISCOUNT_BADGES = ['-20%', '-25%', '-15%', '-30%', '-18%']

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, busy } = useCart()
  const primaryImg = getImageUrl(product.images?.[0])
  const discountLabel = DISCOUNT_BADGES[product.id % DISCOUNT_BADGES.length]
  const comparePrice = Number(product.price) * 1.25

  return (
    <article className="group rounded-2xl border border-[#1F1B16]/8 bg-[#FDFBF7] p-4 flex flex-col justify-between transition-colors duration-200 hover:border-[#0D2D23]/25">
      <div>
        <Link
          to={`/product/${product.id}`}
          className="relative aspect-square w-full overflow-hidden rounded-xl bg-[#EFE9DF]/65 block"
        >
          {primaryImg ? (
            <img
              src={primaryImg}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
              <span className="font-serif-editorial text-3xl text-[#1F1B16]/30">
                {product.brand?.slice(0, 2).toUpperCase() || 'DS'}
              </span>
              <span className="mt-1 text-xs text-[#7B7266]">{product.category?.name}</span>
            </div>
          )}

          {/* Subtle bottom gradient on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0D2D23]/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] pointer-events-none" />

          <span className="absolute top-2.5 left-2.5 rounded-md bg-[#C94A35] text-[#FDFBF7] px-2 py-0.5 text-xs font-medium tabular-nums">
            {discountLabel}
          </span>

          {/* Floating quick-view pill on hover */}
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-lg bg-[#FDFBF7]/92 backdrop-blur-sm border border-[#1F1B16]/10 px-2.5 py-1 text-xs font-medium text-[#1F1B16] opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-[opacity,transform] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]">
            <span>View item</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-[#0D2D23]" strokeWidth={1.5} />
          </span>
        </Link>

        <div className="pt-3 space-y-1">
          <p className="text-xs text-[#7B7266] truncate">{product.brand}</p>
          <Link
            to={`/product/${product.id}`}
            className="text-sm font-medium text-[#1F1B16] group-hover:text-[#0D2D23] transition-colors duration-200 line-clamp-1 block"
          >
            {product.name}
          </Link>
        </div>
      </div>

      <div className="pt-3 mt-2 flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 tabular-nums">
          <span className="text-sm font-medium text-[#1F1B16]">{formatPrice(product.price)}</span>
          <span className="text-xs text-[#7B7266] line-through">{formatPrice(comparePrice)}</span>
        </div>

        <button
          type="button"
          disabled={busy || product.inventory <= 0}
          onClick={() => void addToCart(product.id, 1)}
          title={product.inventory > 0 ? 'Add to cart' : 'Out of stock'}
          className="w-9 h-9 rounded-lg bg-[#0D2D23] hover:bg-[#143D30] text-[#F7F4EE] flex items-center justify-center transition-[background-color,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105 active:scale-95 cursor-pointer disabled:opacity-40"
        >
          <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
        </button>
      </div>
    </article>
  )
}
