import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from 'react'
import { User, MapPin, Mail, Shield, Check, Save, ArrowLeft, Package, Camera, Trash2, Upload } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { userApi, getErrorMessage } from '../lib/api'

export function ProfilePage() {
  const { user, userId, isAuthenticated, refreshUser, isAdmin } = useAuth()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [postalCode, setPostalCode] = useState('')
  const [country, setCountry] = useState('')

  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth')
      return
    }
    if (user) {
      setFirstName(user.firstName || '')
      setLastName(user.lastName || '')
      setProfileImage(user.profileImage || null)
      if (user.address) {
        setStreet(user.address.street || '')
        setCity(user.address.city || '')
        setState(user.address.state || '')
        setPostalCode(user.address.postalCode || '')
        setCountry(user.address.country || '')
      }
    }
  }, [user, isAuthenticated, navigate])

  const handleImageFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (PNG, JPG, WebP)', 'error')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size should be less than 2MB', 'error')
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const base64 = event.target?.result as string
      setProfileImage(base64)
      showToast('Image selected! Click "Save Changes" to apply.', 'info')
    }
    reader.readAsDataURL(file)
  }

  const handleRemoveImage = () => {
    setProfileImage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    showToast('Photo removed. Click "Save Changes" to apply.', 'info')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!userId) return

    setSaving(true)
    setSavedSuccess(false)
    try {
      await userApi.update(userId, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        profileImage: profileImage !== null ? profileImage : undefined,
        address: {
          street: street.trim(),
          city: city.trim(),
          state: state.trim(),
          postalCode: postalCode.trim(),
          country: country.trim(),
        },
      })
      await refreshUser()
      showToast('Profile updated successfully!', 'success')
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated) return null

  const displayName = firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Your Profile'
  const initials = firstName ? firstName[0]?.toUpperCase() : user?.email?.[0]?.toUpperCase() || 'U'

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      {/* Breadcrumb / Top Bar */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7B7266] hover:text-[#1F1B16] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Store</span>
        </Link>
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0D2D23] hover:underline"
        >
          <Package className="w-3.5 h-3.5" />
          <span>View My Orders</span>
        </Link>
      </div>

      <div className="bg-white border border-[#E6E3DC] rounded-3xl p-6 sm:p-10 shadow-sm">
        {/* Profile Card Header with Editable Photo */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-[#E6E3DC]">
          <div className="flex flex-col sm:flex-row items-center sm:items-center gap-5">
            {/* User Avatar with Edit Trigger */}
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#0D2D23]/15 shadow-sm bg-[#0D2D23] flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={displayName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif-editorial text-3xl font-medium text-[#F7F4EE]">
                    {initials}
                  </span>
                )}
              </div>

              {/* Hover Overlay Button to Upload */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Change Photo"
                className="absolute inset-0 rounded-full bg-black/45 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 cursor-pointer backdrop-blur-[2px]"
              >
                <Camera className="w-5 h-5" />
                <span className="text-[10px] font-medium">Edit</span>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h1 className="font-serif-editorial text-2xl sm:text-3xl font-medium text-[#14221C]">
                  {displayName}
                </h1>
                {isAdmin && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EFE9DF] text-[#0D2D23] font-medium text-xs">
                    <Shield className="w-3.5 h-3.5" /> Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-[#7B7266] flex items-center justify-center sm:justify-start gap-1.5 mt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{user?.email}</span>
              </p>

              {/* Photo Actions */}
              <div className="flex items-center justify-center sm:justify-start gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-[#DCD8CF] hover:bg-[#F8F7F4] text-xs font-medium text-[#14221C] transition-colors cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-[#0D2D23]" />
                  <span>Upload Photo</span>
                </button>
                {profileImage && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form section */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          {/* Section 1: Name and Credentials */}
          <div>
            <h2 className="text-sm font-semibold text-[#14221C] uppercase tracking-wider flex items-center gap-2 mb-4">
              <User className="w-4 h-4 text-[#0D2D23]" />
              <span>Full Name &amp; Contact</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">First Name</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. John"
                  className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23] transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">Last Name</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Doe"
                  className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23] transition-colors"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full rounded-xl border border-[#E6E3DC] bg-[#EFE9DF]/40 px-4 py-2.5 text-sm text-[#7B7266] cursor-not-allowed"
                />
                <p className="text-[11px] text-[#7B7266] mt-1">Email address is permanently tied to your account login.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Address Information */}
          <div className="pt-6 border-t border-[#E6E3DC]">
            <h2 className="text-sm font-semibold text-[#14221C] uppercase tracking-wider flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-[#0D2D23]" />
              <span>Shipping &amp; Delivery Address</span>
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">Street Address</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. 123 Fashion Blvd, Apt 4B"
                  className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23] transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">State / Province</label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Maharashtra"
                    className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23] transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">Postal / ZIP Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="e.g. 400001"
                    className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#4E5B55] mb-1.5">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    placeholder="e.g. India"
                    className="w-full rounded-xl border border-[#DCD8CF] bg-[#F8F7F4] px-4 py-2.5 text-sm text-[#14221C] focus:outline-none focus:border-[#0D2D23] transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-6 border-t border-[#E6E3DC] flex items-center justify-end gap-3">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0D2D23] hover:bg-[#143D30] text-[#F7F4EE] px-6 py-2.5 text-sm font-medium transition-all shadow-sm active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Changes Saved</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
