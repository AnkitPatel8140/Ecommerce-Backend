import { useEffect, useMemo, useRef, useState, type TouchEvent, type WheelEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Headphones,
  Watch,
  Shirt,
  Footprints,
  Briefcase,
  Home,
  LayoutGrid,
  Truck,
  RotateCcw,
  ShieldCheck,
  Headset,
  BadgeCheck,
  Tag,
  Layers,
} from 'lucide-react'
import { categoryApi, getErrorMessage, productApi } from '../lib/api'
import type { Category, ProductDto } from '../types/api'
import { ProductCard } from '../components/product/ProductCard'
import { useToast } from '../context/ToastContext'

interface HeroSlide {
  id: string
  badgeTitle: string
  badgePercent: string
  title: string
  subtitle: string
  cta: string
  categoryFilter: string
  scrimStyle: string
  image: string
  imageAlt: string
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'summer-sale',
    badgeTitle: 'Summer sale',
    badgePercent: '40%',
    title: 'Elevate your everyday',
    subtitle: 'Curated gadgets, watches, footwear, and home essentials built for daily use.',
    cta: 'Shop collection',
    categoryFilter: 'ALL',
    scrimStyle: 'linear-gradient(90deg, #E8E3D5 0%, rgba(232,227,213,0.88) 32%, rgba(232,227,213,0.18) 55%, rgba(232,227,213,0) 78%)',
    image: '/images/hero/hero-summer.jpg',
    imageAlt: 'Sage luggage, white sneakers, wristwatch, and retro speaker',
  },
  {
    id: 'tech-gadgets',
    badgeTitle: 'Tech deals',
    badgePercent: '35%',
    title: 'Smart living essentials',
    subtitle: 'Active noise-cancelling headphones, smartwatches, and wireless speakers.',
    cta: 'Explore gadgets',
    categoryFilter: 'Gadgets',
    scrimStyle: 'linear-gradient(90deg, #DDE8EC 0%, rgba(221,232,236,0.88) 32%, rgba(221,232,236,0.18) 55%, rgba(221,232,236,0) 78%)',
    image: '/images/hero/hero-gadgets.jpg',
    imageAlt: 'Wireless headphones, smartwatch, and retro Bluetooth speaker',
  },
  {
    id: 'watches',
    badgeTitle: 'Timepieces',
    badgePercent: '30%',
    title: 'Precision on your wrist',
    subtitle: 'Brushed steel chronographs and Italian leather strap watches.',
    cta: 'Shop watches',
    categoryFilter: 'Watches',
    scrimStyle: 'linear-gradient(90deg, #EDE4D8 0%, rgba(237,228,216,0.88) 32%, rgba(237,228,216,0.18) 55%, rgba(237,228,216,0) 78%)',
    image: '/images/hero/hero-watches.jpg',
    imageAlt: 'Minimalist steel and leather chronograph watches',
  },
  {
    id: 'fashion-shoes',
    badgeTitle: 'New arrivals',
    badgePercent: '45%',
    title: 'Fresh styles just in',
    subtitle: 'Breathable linen overshirts, tailored chinos, and everyday sneakers.',
    cta: 'Shop fashion',
    categoryFilter: 'Fashion',
    scrimStyle: 'linear-gradient(90deg, #DCE6DF 0%, rgba(220,230,223,0.88) 32%, rgba(220,230,223,0.18) 55%, rgba(220,230,223,0) 78%)',
    image: '/images/hero/hero-fashion.jpg',
    imageAlt: 'Sage linen shirts, chino trousers, and white sneakers',
  },
]

const CATEGORY_TILES = [
  { name: 'ALL', label: 'All items', icon: LayoutGrid },
  { name: 'Gadgets', label: 'Gadgets', icon: Headphones },
  { name: 'Watches', label: 'Watches', icon: Watch },
  { name: 'Shoes', label: 'Shoes', icon: Footprints },
  { name: 'Fashion', label: 'Fashion', icon: Shirt },
  { name: 'Bags', label: 'Bags', icon: Briefcase },
  { name: 'Home & Living', label: 'Home', icon: Home },
]

export function HomePage() {
  const [products, setProducts] = useState<ProductDto[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [slideIdx, setSlideIdx] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [newsletterEmail, setNewsletterEmail] = useState('')

  const location = useLocation()
  const { showToast } = useToast()
  const lastSwipeAt = useRef(0)
  const touchStartX = useRef<number | null>(null)

  const goNextSlide = () => setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)
  const goPrevSlide = () => setSlideIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)

  const handleHeroWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 24) return
    const now = Date.now()
    if (now - lastSwipeAt.current < 450) return
    lastSwipeAt.current = now
    if (e.deltaX > 0) goNextSlide()
    else goPrevSlide()
  }

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null
  }

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return
    const endX = e.changedTouches[0]?.clientX ?? touchStartX.current
    const diff = touchStartX.current - endX
    touchStartX.current = null
    if (Math.abs(diff) < 40) return
    if (diff > 0) goNextSlide()
    else goPrevSlide()
  }

  const urlParams = useMemo(() => new URLSearchParams(location.search), [location.search])
  const searchQuery = urlParams.get('q') ?? ''
  const categoryQuery = urlParams.get('category') ?? ''

  useEffect(() => {
    if (categoryQuery) {
      setSelectedCategory(categoryQuery)
    }
  }, [categoryQuery])

  useEffect(() => {
    let active = true
    async function load() {
      try {
        const [prods, cats] = await Promise.all([productApi.getAll(), categoryApi.getAll()])
        if (active) {
          setProducts(prods)
          setCategories(cats)
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
  }, [showToast])

  useEffect(() => {
    const timer = setInterval(() => {
      setSlideIdx((prev) => (prev + 1) % HERO_SLIDES.length)
    }, 5200)
    return () => clearInterval(timer)
  }, [])

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCategory =
        selectedCategory === 'ALL' || p.category?.name?.toLowerCase() === selectedCategory.toLowerCase()
      const q = searchQuery.trim().toLowerCase()
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.category?.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      return matchesCategory && matchesSearch
    })
  }, [products, selectedCategory, searchQuery])

  const topPicks = useMemo(() => products.slice(0, 5), [products])
  const currentSlide = HERO_SLIDES[slideIdx]

  const jumpToCategory = (cat: string) => {
    setSelectedCategory(cat)
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="bg-[#F7F4EE] text-[#1F1B16]">
      {/* Category Strip (above hero) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-2">
        <div className="no-scrollbar flex items-center justify-between gap-3 overflow-x-auto">
          {CATEGORY_TILES.map((cat) => {
            const Icon = cat.icon
            const active = selectedCategory.toLowerCase() === cat.name.toLowerCase()
            return (
              <button
                key={cat.name}
                type="button"
                onClick={() => jumpToCategory(cat.name)}
                className={`inline-flex items-center justify-center gap-2 h-9 px-5 sm:flex-1 rounded-lg border text-xs font-medium shrink-0 transition-colors duration-150 cursor-pointer ${
                  active
                    ? 'bg-[#0D2D23] text-[#F7F4EE] border-[#0D2D23]'
                    : 'bg-[#FDFBF7] text-[#5E554A] border-[#1F1B16]/10 hover:border-[#0D2D23]/40 hover:text-[#1F1B16]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Hero Deal Carousel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-3 pb-8">
        <div
          onWheel={handleHeroWheel}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          className="relative overflow-hidden rounded-2xl border border-[#1F1B16]/8 touch-pan-y select-none"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="relative p-8 sm:p-12 lg:p-14 min-h-[400px] sm:min-h-[460px] flex items-center"
            >
              {/* Full-bleed background image at natural framing */}
              <img
                src={currentSlide.image}
                alt={currentSlide.imageAlt}
                className="absolute inset-0 w-full h-full object-cover object-right"
              />

              {/* Seamless left-to-right blend scrim */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: currentSlide.scrimStyle }}
              />

              {/* Top-right hanging deal ribbon */}
              <div className="absolute top-0 right-5 z-10 rounded-b-lg bg-[#0D2D23] text-[#F7F4EE] px-3 py-2 text-center shadow-[0_6px_16px_rgba(0,0,0,0.12)]">
                <p className="font-serif-editorial text-xs text-[#F7F4EE] leading-tight border-b border-white/15 pb-1 mb-1">
                  {currentSlide.badgeTitle}
                </p>
                <p className="text-[10px] text-[#DCE7DF]/85 leading-none">Up to</p>
                <p className="text-lg font-medium text-[#EAE5D6] leading-tight my-0.5 tabular-nums">
                  {currentSlide.badgePercent}
                </p>
                <p className="text-[10px] text-[#DCE7DF]/85 leading-none">off</p>
              </div>

              {/* Left copy block */}
              <div className="relative z-10 max-w-xl space-y-5">
                <h1 className="font-serif-editorial text-4xl sm:text-5xl lg:text-6xl font-medium text-[#1F1B16] leading-[1.06] tracking-[-0.02em]">
                  {currentSlide.title}
                </h1>

                <p className="text-base sm:text-lg text-[#5E554A] max-w-md leading-relaxed">
                  {currentSlide.subtitle}
                </p>

                <div className="pt-1 flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => jumpToCategory(currentSlide.categoryFilter)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0D2D23] hover:bg-[#143D30] text-[#F7F4EE] h-11 px-6 text-sm font-medium transition-colors duration-150 active:scale-[0.98] cursor-pointer"
                  >
                    <span>{currentSlide.cta}</span>
                    <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-[#5E554A]">
                  <span className="inline-flex items-center gap-1.5">
                    <BadgeCheck className="w-4 h-4 text-[#5E554A]" strokeWidth={1.5} />
                    Verified inventory
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Tag className="w-4 h-4 text-[#5E554A]" strokeWidth={1.5} />
                    Seasonal pricing
                  </span>
                  <span className="inline-flex items-center gap-1.5 tabular-nums">
                    <Layers className="w-4 h-4 text-[#5E554A]" strokeWidth={1.5} />
                    {products.length} items in stock
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2">
            {HERO_SLIDES.map((s, idx) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSlideIdx(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-200 cursor-pointer ${
                  idx === slideIdx ? 'w-6 bg-[#0D2D23]' : 'w-2 bg-[#1F1B16]/25'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Top Picks */}
      {topPicks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#1F1B16]">
              Top picks for you
            </h2>
            <button
              type="button"
              onClick={() => jumpToCategory('ALL')}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D2D23] hover:underline cursor-pointer"
            >
              <span>See all deals</span>
              <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {topPicks.map((p) => (
              <ProductCard key={`top-${p.id}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* 3-Column Category Spotlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div
            onClick={() => jumpToCategory('Fashion')}
            className="cursor-pointer rounded-2xl border border-[#1F1B16]/8 bg-[#E2EAE4] p-6 flex flex-col justify-between min-h-[160px] hover:border-[#0D2D23]/30 transition-colors duration-150"
          >
            <div>
              <p className="text-xs text-[#5E554A]">New arrivals</p>
              <h3 className="font-serif-editorial text-2xl font-medium text-[#1F1B16] mt-1">Fresh styles just in</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D2D23] mt-6">
              Shop fashion <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </span>
          </div>

          <div
            onClick={() => jumpToCategory('Home & Living')}
            className="cursor-pointer rounded-2xl border border-[#1F1B16]/8 bg-[#EAE5D6] p-6 flex flex-col justify-between min-h-[160px] hover:border-[#0D2D23]/30 transition-colors duration-150"
          >
            <div>
              <p className="text-xs text-[#5E554A]">Home refresh</p>
              <h3 className="font-serif-editorial text-2xl font-medium text-[#1F1B16] mt-1">Make your space better</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D2D23] mt-6">
              Shop home <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </span>
          </div>

          <div
            onClick={() => jumpToCategory('Gadgets')}
            className="cursor-pointer rounded-2xl border border-[#1F1B16]/8 bg-[#E2ECEF] p-6 flex flex-col justify-between min-h-[160px] hover:border-[#0D2D23]/30 transition-colors duration-150"
          >
            <div>
              <p className="text-xs text-[#5E554A]">Tech essentials</p>
              <h3 className="font-serif-editorial text-2xl font-medium text-[#1F1B16] mt-1">Upgrade your setup</h3>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-[#0D2D23] mt-6">
              Shop gadgets <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
            </span>
          </div>
        </div>
      </section>

      {/* Full Catalog */}
      <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#1F1B16]">
              {searchQuery ? `Results for "${searchQuery}"` : 'All products'}
            </h2>
            <p className="text-xs text-[#7B7266] mt-1 tabular-nums">
              Showing {filteredProducts.length} of {products.length} items
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-[#0D2D23] text-[#F7F4EE]'
                  : 'bg-[#FDFBF7] border border-[#1F1B16]/12 text-[#5E554A] hover:border-[#0D2D23]'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCategory(c.name)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-colors duration-150 cursor-pointer ${
                  selectedCategory.toLowerCase() === c.name.toLowerCase()
                    ? 'bg-[#0D2D23] text-[#F7F4EE]'
                    : 'bg-[#FDFBF7] border border-[#1F1B16]/12 text-[#5E554A] hover:border-[#0D2D23]'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-72 rounded-2xl bg-[#FDFBF7] border border-[#1F1B16]/8" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-[#1F1B16]/12 bg-[#FDFBF7] p-12 text-center">
            <p className="font-serif-editorial text-2xl text-[#1F1B16]">No products match your filter</p>
            <button
              type="button"
              onClick={() => setSelectedCategory('ALL')}
              className="mt-4 rounded-lg bg-[#0D2D23] text-[#F7F4EE] px-5 py-2 text-xs font-medium cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Newsletter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="rounded-2xl bg-[#0D2D23] text-[#F7F4EE] p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="font-serif-editorial text-2xl sm:text-3xl font-medium">Stay in the loop</h2>
            <p className="text-sm text-[#DCE7DF] mt-1 max-w-md">
              Get seasonal drops, price reductions, and new arrivals in your inbox.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (newsletterEmail.trim()) {
                showToast('Subscribed to DreamShops updates', 'success')
                setNewsletterEmail('')
              }
            }}
            className="flex w-full max-w-md rounded-xl bg-[#FDFBF7] p-1.5"
          >
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="Email address"
              className="flex-1 bg-transparent px-3 text-sm text-[#1F1B16] placeholder:text-[#7B7266] focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-lg bg-[#DCE7DF] hover:bg-[#cde0d3] text-[#0D2D23] px-5 py-2 text-sm font-medium cursor-pointer transition-colors duration-150"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

      {/* Service Guarantees */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-2xl border border-[#1F1B16]/8 bg-[#FDFBF7] p-6">
          <div className="flex items-center gap-3">
            <Truck className="w-[18px] h-[18px] text-[#5E554A] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-[#1F1B16]">Free shipping</p>
              <p className="text-xs text-[#7B7266]">On orders over $49</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="w-[18px] h-[18px] text-[#5E554A] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-[#1F1B16]">Easy returns</p>
              <p className="text-xs text-[#7B7266]">30-day return window</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-[18px] h-[18px] text-[#5E554A] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-[#1F1B16]">Secure checkout</p>
              <p className="text-xs text-[#7B7266]">JWT protected sessions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Headset className="w-[18px] h-[18px] text-[#5E554A] shrink-0" strokeWidth={1.5} />
            <div>
              <p className="text-sm font-medium text-[#1F1B16]">Order tracking</p>
              <p className="text-xs text-[#7B7266]">Live status updates</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
