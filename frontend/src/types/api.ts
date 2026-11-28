export interface ApiResponse<T> {
  message: string
  data: T
}

export interface JwtResponse {
  id: number
  token: string
}

export interface Category {
  id: number
  name: string
}

export interface ImageDto {
  id: number
  fileName: string
  downloadUrl: string
}

export interface ProductDto {
  id: number
  name: string
  brand: string
  price: number
  inventory: number
  description: string
  category: Category
  images: ImageDto[]
}

export interface CartItemDto {
  itemId: number
  quantity: number
  unitPrice: number
  product: ProductDto
}

export interface CartDto {
  cartId: number
  items: CartItemDto[]
  totalAmount: number
}

export interface OrderItemDto {
  productId: number
  productName: string
  productBrand: string
  quantity: number
  price: number
}

export interface OrderDto {
  id: number
  userId: number
  orderDate: string
  totalAmount: number
  status: string
  items: OrderItemDto[]
}

export interface AddressDto {
  id?: number
  street?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
}

export interface UserDto {
  id: number
  firstName: string
  lastName: string
  email: string
  profileImage?: string | null
  orders: OrderDto[]
  cart: CartDto | null
  address?: AddressDto | null
}

export interface UserUpdatePayload {
  firstName?: string
  lastName?: string
  profileImage?: string | null
  address?: AddressDto
}

export interface DecodedToken {
  sub: string
  id: number
  roles: string[]
  iat: number
  exp: number
}

export interface ProductPayload {
  id?: number
  name: string
  brand: string
  price: number
  inventory: number
  description: string
  category: { name: string }
}
