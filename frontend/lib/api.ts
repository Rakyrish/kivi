import { API_URL, INTERNAL_API_URL } from './constants'
import { Product, Category, SiteSetting, BlogPost, ContactSubmission } from '../types'

const getApiUrl = () => {
  return typeof window === 'undefined' ? INTERNAL_API_URL : API_URL
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiUrl()
  const url = `${baseUrl}${path}`

  // Extract token from cookie (client-side only)
  let token = ''
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/)
    token = match ? decodeURIComponent(match[1]) : ''
  }

  const headers = new Headers(options.headers)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Token ${token}`)
  }
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `API request failed with status ${response.status}`)
  }

  // Handle sitemap or text responses, though usually JSON
  const contentType = response.headers.get('content-type')
  if (contentType && contentType.includes('application/json')) {
    return response.json() as Promise<T>
  }
  return response.text() as unknown as Promise<T>
}

export const api = {
  // Products
  async getProducts(params: Record<string, string | number> = {}): Promise<{ results: Product[]; count: number }> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, String(val))
      }
    })
    const queryStr = query.toString()
    return apiRequest<{ results: Product[]; count: number }>(`/products/${queryStr ? `?${queryStr}` : ''}`)
  },

  async getProduct(slug: string): Promise<Product> {
    return apiRequest<Product>(`/products/${slug}/`)
  },

  async getProductSlugs(): Promise<{ slug: string }[]> {
    return apiRequest<{ slug: string }[]>(`/products/slugs/`)
  },

  async getFeaturedProducts(): Promise<Product[]> {
    return apiRequest<Product[]>(`/products/featured/`)
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    return apiRequest<Category[]>('/products/categories/')
  },

  async getCategory(slug: string): Promise<Category> {
    return apiRequest<Category>(`/products/categories/${slug}/`)
  },

  // Site Settings
  async getSettings(): Promise<SiteSetting> {
    return apiRequest<SiteSetting>('/products/settings/')
  },

  // Blog
  async getBlogPosts(): Promise<BlogPost[]> {
    return apiRequest<BlogPost[]>('/blog/')
  },

  async getBlogPost(slug: string): Promise<BlogPost> {
    return apiRequest<BlogPost>(`/blog/${slug}/`)
  },

  // Contacts
  async submitContact(data: ContactSubmission): Promise<ContactSubmission> {
    return apiRequest<ContactSubmission>('/contacts/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  // Admin and Write Operations
  async login(username: string, password: string): Promise<{ token: string }> {
    return apiRequest<{ token: string }>('/auth/token/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    })
  },

  async saveProduct(product: Partial<Product>, isEdit: boolean, slug?: string): Promise<Product> {
    const method = isEdit ? 'PUT' : 'POST'
    const path = isEdit ? `/products/${slug}/` : '/products/'
    return apiRequest<Product>(path, {
      method,
      body: JSON.stringify(product),
    })
  },

  async deleteProduct(slug: string): Promise<void> {
    return apiRequest<void>(`/products/${slug}/`, {
      method: 'DELETE',
    })
  },

  async generateAIProduct(productName: string, category: string): Promise<any> {
    return apiRequest<any>('/ai/generate-product/', {
      method: 'POST',
      body: JSON.stringify({ product_name: productName, category }),
    })
  }
}
