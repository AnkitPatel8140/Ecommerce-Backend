import { BrowserRouter, Link, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { ToastProvider } from './context/ToastContext'
import { SmoothScroll } from './components/motion/SmoothScroll'
import { Navbar } from './components/layout/Navbar'
import { BrandLogo } from './components/layout/BrandLogo'
import { CartDrawer } from './components/cart/CartDrawer'
import { HomePage } from './pages/HomePage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { AuthPage } from './pages/AuthPage'
import { OrdersPage } from './pages/OrdersPage'
import { AdminPage } from './pages/AdminPage'

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <SmoothScroll>
              <div className="min-h-screen bg-[#F8F7F4] text-[#14221C] flex flex-col">
                <Navbar />
                <CartDrawer />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/product/:id" element={<ProductDetailPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/orders" element={<OrdersPage />} />
                    <Route path="/admin" element={<AdminPage />} />
                  </Routes>
                </main>

                <footer className="bg-[#0D2D23] text-white mt-12">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="space-y-3">
                      <BrandLogo variant="dark" />
                      <p className="text-xs text-[#DCE7DF]/80 leading-relaxed max-w-xs">
                        Your one-stop shop for quality gadgets, watches, shoes, and fashion. Live better with DreamShops.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="font-semibold text-white mb-3">Shop</p>
                      <Link to="/?category=Gadgets#catalog" className="block text-[#DCE7DF]/80 hover:text-white">
                        Gadgets &amp; Audio
                      </Link>
                      <Link to="/?category=Watches#catalog" className="block text-[#DCE7DF]/80 hover:text-white">
                        Watches
                      </Link>
                      <Link to="/?category=Shoes#catalog" className="block text-[#DCE7DF]/80 hover:text-white">
                        Footwear
                      </Link>
                      <Link to="/?category=Fashion#catalog" className="block text-[#DCE7DF]/80 hover:text-white">
                        Fashion &amp; Apparel
                      </Link>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="font-semibold text-white mb-3">Customer Service</p>
                      <Link to="/orders" className="block text-[#DCE7DF]/80 hover:text-white">
                        Track Order
                      </Link>
                      <Link to="/auth" className="block text-[#DCE7DF]/80 hover:text-white">
                        My Account
                      </Link>
                      <Link to="/admin" className="block text-[#DCE7DF]/80 hover:text-white">
                        Admin Studio
                      </Link>
                    </div>

                    <div className="space-y-2 text-xs">
                      <p className="font-semibold text-white mb-3">Promise</p>
                      <p className="text-[#DCE7DF]/80">Free Shipping over $49</p>
                      <p className="text-[#DCE7DF]/80">30-Day Easy Returns</p>
                      <p className="text-[#DCE7DF]/80">100% Secure Checkout</p>
                    </div>
                  </div>
                  <div className="border-t border-white/10 py-4 text-center text-[11px] text-[#DCE7DF]/70">
                    © 2026 DreamShops. All rights reserved.
                  </div>
                </footer>
              </div>
            </SmoothScroll>
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
