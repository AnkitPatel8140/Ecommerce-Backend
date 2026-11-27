import axios from 'axios'
import type {
  ApiResponse,
  CartDto,
  Category,
  DecodedToken,
  ImageDto,
  JwtResponse,
  OrderDto,
  ProductDto,
  ProductPayload,
  UserDto,
} from '../types/api'

export const TOKEN_STORAGE_KEY = 'dream_shops_token'

const API_BASE_URL = import.meta.env.VITE_API_URL

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export function parseJwt(token: string): DecodedToken | null {
  try {
    const base64Url = token.split('.')[1]
    if (!base64Url) return null
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    )
    return JSON.parse(jsonPayload) as DecodedToken
  } catch {
    return null
  }
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; data?: string } | string | undefined
    if (typeof data === 'string') return data
    if (data?.message) {
      return typeof data.data === 'string' && data.data ? `${data.message}: ${data.data}` : data.message
    }
    return error.message
  }
  if (error instanceof Error) return error.message
  return 'An unexpected error occurred'
}

/**
 * ImageController maps @RequestMapping("${api.prefix}/images") + @GetMapping("/images/image/download/{imageId}")
 * so the real download endpoint is /api/v1/images/images/image/download/{id}.
 */
export function getImageUrl(image?: ImageDto | null): string | null {
  if (!image?.id) return null
  return `/api/v1/images/images/image/download/${image.id}`
}

export function formatPrice(value: number | string | undefined): string {
  const num = Number(value ?? 0)
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(num)
}

export const authApi = {
  login: async (email: string, password: string) => {
    const res = await api.post<ApiResponse<JwtResponse>>('/auth/login', { email, password })
    return res.data
  },
  signup: async (payload: { firstName: string; lastName: string; email: string; password: string }) => {
    const res = await api.post<string>('/auth/signup', payload)
    return res.data
  },
}

export const userApi = {
  getById: async (id: number) => {
    const res = await api.get<ApiResponse<UserDto>>(`/users/${id}/user`)
    return res.data.data
  },
  update: async (userId: number, payload: { firstName: string; lastName: string }) => {
    const res = await api.put<ApiResponse<UserDto>>(`/users/${userId}/update`, payload)
    return res.data.data
  },
}

export const productApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<ProductDto[]>>('/products/all')
    return res.data.data ?? []
  },
  getById: async (productId: number) => {
    const res = await api.get<ApiResponse<ProductDto>>(`/products/product/${productId}/product`)
    return res.data.data
  },
  add: async (payload: ProductPayload) => {
    const res = await api.post<ApiResponse<ProductDto>>('/products/add', payload)
    return res.data.data
  },
  update: async (productId: number, payload: ProductPayload) => {
    const res = await api.put<ApiResponse<ProductDto>>(`/products/product/${productId}/update`, payload)
    return res.data.data
  },
  delete: async (productId: number) => {
    const res = await api.delete<ApiResponse<number>>(`/products/product/${productId}/delete`)
    return res.data
  },
}

export const categoryApi = {
  getAll: async () => {
    const res = await api.get<ApiResponse<Category[]>>('/categories/all')
    return res.data.data ?? []
  },
  add: async (name: string) => {
    const res = await api.post<ApiResponse<Category>>('/categories/add', { name })
    return res.data.data
  },
  update: async (id: number, name: string) => {
    const res = await api.put<ApiResponse<Category>>(`/categories/category/${id}/update`, { name })
    return res.data.data
  },
  delete: async (id: number) => {
    const res = await api.delete<ApiResponse<null>>(`/categories/category/${id}/delete`)
    return res.data
  },
}

export const imageApi = {
  upload: async (productId: number, files: File[]) => {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    formData.append('productId', String(productId))
    const res = await api.post<ApiResponse<ImageDto[]>>('/images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return res.data.data ?? []
  },
  delete: async (imageId: number) => {
    const res = await api.delete<ApiResponse<null>>(`/images/image/${imageId}/delete`)
    return res.data
  },
}

export const cartApi = {
  getMyCart: async (cartId: number) => {
    const res = await api.get<ApiResponse<CartDto>>(`/carts/${cartId}/my-cart`)
    return res.data.data
  },
  clearCart: async (cartId: number) => {
    const res = await api.delete<ApiResponse<null>>(`/carts/${cartId}/clear`)
    return res.data
  },
  addItem: async (productId: number, quantity: number) => {
    const res = await api.post<ApiResponse<null>>('/cartItems/item/add', null, {
      params: { productId, quantity },
    })
    return res.data
  },
  updateItemQuantity: async (cartId: number, itemId: number, quantity: number) => {
    const res = await api.put<ApiResponse<null>>(`/cartItems/cart/${cartId}/item/${itemId}/update`, null, {
      params: { quantity },
    })
    return res.data
  },
  removeItem: async (cartId: number, itemId: number) => {
    const res = await api.delete<ApiResponse<null>>(`/cartItems/cart/${cartId}/item/${itemId}/remove`)
    return res.data
  },
}

export const orderApi = {
  placeOrder: async (userId: number) => {
    const res = await api.post<ApiResponse<OrderDto>>('/orders/order', null, {
      params: { userId },
    })
    return res.data.data
  },
  getUserOrders: async (userId: number) => {
    const res = await api.get<ApiResponse<OrderDto[]>>(`/orders/${userId}/orders`)
    return res.data.data ?? []
  },
}
