import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Plus, Trash2, Edit3, Upload, Image as ImageIcon, ShieldAlert, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { categoryApi, formatPrice, getErrorMessage, getImageUrl, imageApi, productApi } from '../lib/api'
import type { Category, ProductDto } from '../types/api'

const EMPTY_FORM = {
  name: '',
  brand: '',
  price: '',
  inventory: '',
  description: '',
  categoryName: '',
}

export function AdminPage() {
  const { isAdmin, isAuthenticated } = useAuth()
  const { showToast } = useToast()

  const [tab, setTab] = useState<'products' | 'categories'>('products')
  const [products, setProducts] = useState<ProductDto[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [savingProduct, setSavingProduct] = useState(false)

  const [newCategory, setNewCategory] = useState('')
  const [savingCategory, setSavingCategory] = useState(false)
  const [uploadingProductId, setUploadingProductId] = useState<number | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [prods, cats] = await Promise.all([productApi.getAll(), categoryApi.getAll()])
      setProducts(prods)
      setCategories(cats)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    void loadData()
  }, [loadData])

  if (!isAuthenticated || !isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <ShieldAlert className="w-12 h-12 text-[#0D2D23] mx-auto" />
        <h1 className="font-serif-editorial text-4xl font-bold text-[#14221C]">Admin Access Required</h1>
        <p className="text-sm text-[#627069]">
          Sign in with an administrator account (e.g. <code className="text-[#0D2D23] font-semibold">admin1@email.com</code> /{' '}
          <code className="text-[#0D2D23] font-semibold">123456</code>) to manage products, categories, and images.
        </p>
        <Link
          to="/auth"
          className="inline-flex mt-4 rounded-full bg-[#0D2D23] text-white px-7 py-3 text-xs font-semibold uppercase tracking-[0.16em]"
        >
          Go to Sign In
        </Link>
      </div>
    )
  }

  const handleProductSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSavingProduct(true)
    try {
      const payload = {
        name: form.name.trim(),
        brand: form.brand.trim(),
        price: Number(form.price),
        inventory: Number(form.inventory),
        description: form.description.trim(),
        category: { name: form.categoryName.trim() },
      }
      if (editingId) {
        await productApi.update(editingId, payload)
        showToast('Product updated.', 'success')
      } else {
        await productApi.add(payload)
        showToast('Product added to store.', 'success')
      }
      setForm(EMPTY_FORM)
      setEditingId(null)
      await loadData()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSavingProduct(false)
    }
  }

  const startEditProduct = (p: ProductDto) => {
    setEditingId(p.id)
    setForm({
      name: p.name,
      brand: p.brand,
      price: String(p.price),
      inventory: String(p.inventory),
      description: p.description ?? '',
      categoryName: p.category?.name ?? '',
    })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDeleteProduct = async (id: number) => {
    try {
      await productApi.delete(id)
      showToast('Product deleted.', 'info')
      await loadData()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  const handleImageUpload = async (productId: number, files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploadingProductId(productId)
    try {
      await imageApi.upload(productId, Array.from(files))
      showToast('Images uploaded.', 'success')
      await loadData()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setUploadingProductId(null)
    }
  }

  const handleDeleteImage = async (imageId: number) => {
    try {
      await imageApi.delete(imageId)
      showToast('Image removed.', 'info')
      await loadData()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  const handleAddCategory = async (e: FormEvent) => {
    e.preventDefault()
    if (!newCategory.trim()) return
    setSavingCategory(true)
    try {
      await categoryApi.add(newCategory.trim())
      setNewCategory('')
      showToast('Category created.', 'success')
      await loadData()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSavingCategory(false)
    }
  }

  const handleDeleteCategory = async (id: number) => {
    try {
      await categoryApi.delete(id)
      showToast('Category deleted.', 'info')
      await loadData()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-20 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-5 border-b border-[#1F1B16]/8">
        <div>
          <p className="text-xs text-[#7B7266]">Store management</p>
          <h1 className="font-serif-editorial text-4xl font-medium text-[#1F1B16] mt-1">Admin studio</h1>
        </div>

        <div className="inline-flex rounded-xl border border-[#1F1B16]/10 bg-[#FDFBF7] p-1">
          {(['products', 'categories'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`relative px-5 py-2 rounded-lg text-xs font-medium capitalize cursor-pointer ${
                tab === t ? 'text-[#F7F4EE]' : 'text-[#5E554A] hover:text-[#1F1B16]'
              }`}
            >
              {tab === t && (
                <motion.span
                  layoutId="admin-tab"
                  className="absolute inset-0 rounded-lg bg-[#0D2D23]"
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>
      </div>

      {tab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleProductSubmit}
            className="lg:col-span-5 rounded-3xl border border-[#E6E3DC] bg-white p-6 space-y-4 lg:sticky lg:top-32"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-serif-editorial text-2xl font-bold text-[#14221C]">
                {editingId ? `Edit Product #${editingId}` : 'Add New Product'}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingId(null)
                    setForm(EMPTY_FORM)
                  }}
                  className="text-xs text-[#627069] hover:text-[#14221C] inline-flex items-center gap-1 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" /> Cancel
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#4E5B55] mb-1">Name</label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Noise Cancelling Headphones"
                  className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-3.5 py-2 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4E5B55] mb-1">Brand</label>
                <input
                  required
                  value={form.brand}
                  onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))}
                  placeholder="Sony"
                  className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-3.5 py-2 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23]"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-[#4E5B55] mb-1">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={form.price}
                  onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                  placeholder="79.99"
                  className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-3.5 py-2 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4E5B55] mb-1">Stock</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={form.inventory}
                  onChange={(e) => setForm((f) => ({ ...f, inventory: e.target.value }))}
                  placeholder="25"
                  className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-3.5 py-2 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4E5B55] mb-1">Category</label>
                <input
                  required
                  list="category-suggestions"
                  value={form.categoryName}
                  onChange={(e) => setForm((f) => ({ ...f, categoryName: e.target.value }))}
                  placeholder="Gadgets"
                  className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-3.5 py-2 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23]"
                />
                <datalist id="category-suggestions">
                  {categories.map((c) => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#4E5B55] mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Product features, material, and specs..."
                className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-3.5 py-2 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23]"
              />
            </div>

            <button
              type="submit"
              disabled={savingProduct}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#0D2D23] hover:bg-[#164436] text-white py-3 text-xs font-semibold uppercase tracking-[0.16em] transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
              <span>{savingProduct ? 'Saving...' : editingId ? 'Update Product' : 'Add Product'}</span>
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4">
            {loading ? (
              <div className="h-40 rounded-2xl bg-white animate-pulse" />
            ) : (
              products.map((p) => (
                <div key={p.id} className="rounded-2xl border border-[#E6E3DC] bg-white p-5 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-[#627069]">
                        {p.brand} • {p.category?.name}
                      </p>
                      <h3 className="font-serif-editorial text-2xl font-bold text-[#14221C]">{p.name}</h3>
                      <p className="font-mono-code text-xs text-[#0D2D23] mt-1">
                        {formatPrice(p.price)} • Stock: {p.inventory}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 rounded-full border border-[#DCD8CF] hover:border-[#0D2D23] px-3.5 py-1.5 text-xs font-medium text-[#14221C] cursor-pointer">
                        <Upload className="w-3.5 h-3.5 text-[#0D2D23]" />
                        <span>{uploadingProductId === p.id ? 'Uploading...' : 'Images'}</span>
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => void handleImageUpload(p.id, e.target.files)}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => startEditProduct(p)}
                        className="p-2 rounded-full border border-[#DCD8CF] text-[#627069] hover:text-[#0D2D23] cursor-pointer"
                        title="Edit"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleDeleteProduct(p.id)}
                        className="p-2 rounded-full border border-[#DCD8CF] text-[#627069] hover:text-[#E15B44] cursor-pointer"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {p.images && p.images.length > 0 ? (
                    <div className="flex flex-wrap gap-3 pt-2 border-t border-[#EFECE6]">
                      {p.images.map((img) => {
                        const url = getImageUrl(img)
                        return (
                          <div
                            key={img.id}
                            className="relative group w-16 h-16 rounded-lg overflow-hidden border border-[#E6E3DC] bg-[#F4F3EF]"
                          >
                            {url && <img src={url} alt={img.fileName} className="w-full h-full object-cover" />}
                            <button
                              type="button"
                              onClick={() => void handleDeleteImage(img.id)}
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-[#627069] pt-2 border-t border-[#EFECE6]">
                      <ImageIcon className="w-3.5 h-3.5" />
                      <span>No images attached yet.</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleAddCategory}
            className="md:col-span-5 rounded-3xl border border-[#E6E3DC] bg-white p-6 space-y-4"
          >
            <h2 className="font-serif-editorial text-2xl font-bold text-[#14221C]">New Category</h2>
            <div>
              <label className="block text-xs font-medium text-[#4E5B55] mb-1">Category Name</label>
              <input
                required
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Accessories"
                className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-3.5 py-2 text-sm text-[#14221C]"
              />
            </div>
            <button
              type="submit"
              disabled={savingCategory}
              className="w-full rounded-full bg-[#0D2D23] text-white py-3 text-xs font-semibold uppercase tracking-[0.16em] cursor-pointer"
            >
              {savingCategory ? 'Creating...' : 'Add Category'}
            </button>
          </form>

          <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="rounded-2xl border border-[#E6E3DC] bg-white px-5 py-4 flex items-center justify-between"
              >
                <div>
                  <span className="font-mono-code text-[10px] text-[#627069]">ID #{cat.id}</span>
                  <h3 className="font-serif-editorial text-xl font-bold text-[#14221C]">{cat.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDeleteCategory(cat.id)}
                  className="p-2 rounded-full border border-[#E6E3DC] text-[#627069] hover:text-[#E15B44] cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
