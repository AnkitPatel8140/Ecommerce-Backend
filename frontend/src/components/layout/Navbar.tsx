import { Link, useNavigate } from 'react-router-dom'
import { ShoppingCart, User, ShieldCheck, LogOut, Search, Menu, X, Package } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { BrandLogo } from './BrandLogo'

export function Navbar() {
  const navigate = useNavigate()
  const { isAuthenticated, isAdmin, user, logout } = useAuth()
  const { itemCount, openDrawer } = useCart()
  const [searchInput, setSearchInput] = useState('')
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSearch = (e: FormEvent) => {
    e.preventDefault()
    const q = searchInput.trim()
    navigate(q ? `/?q=${encodeURIComponent(q)}#catalog` : '/#catalog')
    setTimeout(() => {
      document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })
    }, 80)
  }

  const mobileLinks = [
    { label: 'Home', to: '/' },
    { label: 'Shop', to: '/#catalog' },
    { label: 'Orders', to: '/orders' },
    { label: 'Profile & Address', to: '/profile' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-[#FDFBF7] border-b border-[#1F1B16]/8">
      {/* Announcement strip */}
      <div className="bg-[#0D2D23] text-[#F7F4EE] text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
          <span>Free shipping on orders over $49</span>
          <span className="hidden sm:inline text-[#F7F4EE]/30">|</span>
          <span>30-day returns</span>
          <span className="hidden sm:inline text-[#F7F4EE]/30">|</span>
          <span>Encrypted checkout</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-6">
        <Link to="/" className="inline-flex items-center shrink-0">
          <BrandLogo variant="light" />
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg items-center relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products"
            className="w-full h-10 rounded-lg border border-[#1F1B16]/12 bg-[#EFE9DF]/60 pl-4 pr-11 text-sm text-[#1F1B16] placeholder:text-[#7B7266] focus:outline-none focus:border-[#0D2D23] focus:bg-[#FDFBF7] transition-colors duration-150"
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md bg-[#0D2D23] hover:bg-[#143D30] text-[#F7F4EE] flex items-center justify-center transition-colors duration-150 cursor-pointer"
          >
            <Search className="w-4 h-4" strokeWidth={1.5} />
          </button>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="hidden sm:flex items-center gap-3">
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium text-[#5E554A] hover:text-[#1F1B16] hover:bg-[#EFE9DF]/70 transition-colors duration-150"
                title="View & Edit Profile"
              >
                {user?.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={user.firstName || 'Profile'}
                    className="w-5 h-5 rounded-full object-cover border border-[#0D2D23]/30"
                  />
                ) : isAdmin ? (
                  <ShieldCheck className="w-4 h-4 text-[#0D2D23]" strokeWidth={1.5} />
                ) : (
                  <User className="w-4 h-4" strokeWidth={1.5} />
                )}
                <span className="max-w-[96px] truncate">{user?.firstName || 'Profile'}</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                title="Sign out"
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-[#7B7266] hover:text-[#1F1B16] hover:bg-[#EFE9DF]/70 transition-colors duration-150 cursor-pointer"
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>
          ) : (
            <Link
              to="/auth"
              className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium text-[#5E554A] hover:text-[#1F1B16] hover:bg-[#EFE9DF]/70 transition-colors duration-150"
            >
              <User className="w-4 h-4" strokeWidth={1.5} />
              <span>Sign in</span>
            </Link>
          )}

          <Link
            to="/orders"
            className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-lg text-sm font-medium text-[#5E554A] hover:text-[#1F1B16] hover:bg-[#EFE9DF]/70 transition-colors duration-150"
          >
            <Package className="w-4 h-4" strokeWidth={1.5} />
            <span>Orders</span>
          </Link>

          {isAdmin && (
            <Link
              to="/admin"
              className="hidden sm:inline-flex items-center gap-2 h-9 px-3 rounded-lg bg-[#EFE9DF] hover:bg-[#E4DDD0] text-sm font-medium text-[#1F1B16] transition-colors duration-150"
            >
              <span>Admin</span>
            </Link>
          )}

          <button
            type="button"
            onClick={openDrawer}
            className="inline-flex items-center gap-2 h-9 px-3.5 rounded-lg bg-[#0D2D23] hover:bg-[#143D30] text-[#F7F4EE] text-sm font-medium transition-colors duration-150 cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" strokeWidth={1.5} />
            <span className="tabular-nums">Cart ({itemCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="md:hidden p-2 rounded-lg text-[#1F1B16]"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-4 h-4" strokeWidth={1.5} /> : <Menu className="w-4 h-4" strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[#1F1B16]/8 bg-[#FDFBF7] px-4 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search products"
              className="w-full h-10 rounded-lg border border-[#1F1B16]/12 bg-[#EFE9DF]/60 pl-4 pr-11 text-sm text-[#1F1B16]"
            />
            <button
              type="submit"
              className="absolute right-1.5 w-7 h-7 rounded-md bg-[#0D2D23] text-[#F7F4EE] flex items-center justify-center"
            >
              <Search className="w-4 h-4" strokeWidth={1.5} />
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {mobileLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg border border-[#1F1B16]/12 px-3 py-1.5 text-xs font-medium text-[#1F1B16]"
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-[#EFE9DF] px-3 py-1.5 text-xs font-medium text-[#1F1B16]"
              >
                Admin studio
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                to="/auth"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg bg-[#0D2D23] px-3 py-1.5 text-xs font-medium text-[#F7F4EE]"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
