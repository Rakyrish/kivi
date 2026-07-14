import { API_ENDPOINTS, API_URL, INTERNAL_API_URL } from './constants'
import { Product, Category, SiteSetting, BlogPost, ContactSubmission, InquiryReply } from '../types'

const getApiUrl = () => {
  return typeof window === 'undefined' ? INTERNAL_API_URL : API_URL
}

type BlogListResponse = BlogPost[] | { results?: BlogPost[]; count?: number }

function normalizeBlogPosts(data: BlogListResponse | null | undefined): BlogPost[] {
  if (Array.isArray(data)) {
    return data
  }

  if (data && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results
  }

  return []
}

async function apiRequest<T>(path: string, options: RequestInit = {}, { forwardAuth = false }: { forwardAuth?: boolean } = {}): Promise<T> {
  const baseUrl = getApiUrl()
  const url = `${baseUrl}${path}`

  // Extract admin token from cookie: client-side via document.cookie (cheap,
  // never affects rendering mode), server-side (Server Components/route
  // handlers) via next/headers — but next/headers' cookies() marks the
  // calling route as dynamic even when caught in a try/catch, which breaks
  // static/ISR rendering for public pages. Only touch it server-side when a
  // caller explicitly opts in (i.e. admin-only server components that
  // genuinely need the staff-only view and are dynamic anyway).
  let token = ''
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/(?:^|; )admin_token=([^;]*)/)
    token = match ? decodeURIComponent(match[1]) : ''
  } else if (forwardAuth) {
    try {
      const { cookies } = await import('next/headers')
      const cookieStore = await cookies()
      token = cookieStore.get('admin_token')?.value || ''
    } catch (_) {
      // Not in a request context (e.g. build-time static generation) - no token available
    }
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

  if (response.status === 401 && !path.includes('/auth/token/')) {
    if (typeof window !== 'undefined') {
      document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      window.location.href = '/admin/login'
    }
  }

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
  async getProducts(params: Record<string, string | number> = {}, opts: { forwardAuth?: boolean } = {}): Promise<{ results: Product[]; count: number }> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, String(val))
      }
    })
    const queryStr = query.toString()
    return apiRequest<{ results: Product[]; count: number }>(`/products/${queryStr ? `?${queryStr}` : ''}`, {}, opts)
  },

  async getProduct(slug: string): Promise<Product> {
    return apiRequest<Product>(`/products/${slug}/`)
  },

  async getProductSlugs(): Promise<{ slug: string }[]> {
    return apiRequest<{ slug: string }[]>(`/products/slugs/`)
  },

  async resolveSlugRedirect(oldSlug: string): Promise<{ new_slug: string | null }> {
    return apiRequest<{ new_slug: string | null }>(`/products/resolve-slug/?slug=${encodeURIComponent(oldSlug)}`)
  },

  async getFeaturedProducts(): Promise<Product[]> {
    return apiRequest<Product[]>(`/products/featured/`)
  },

  // Categories
  async getCategories(opts: { forwardAuth?: boolean } = {}): Promise<Category[]> {
    return apiRequest<Category[]>('/products/categories/', {}, opts)
  },

  async getCategory(slug: string): Promise<Category> {
    return apiRequest<Category>(`/products/categories/${slug}/`)
  },

  // Site Settings
  async getSettings(): Promise<SiteSetting> {
    return apiRequest<SiteSetting>('/products/settings/')
  },

  // Blog
  async getBlogPosts(opts: { forwardAuth?: boolean } = {}): Promise<BlogPost[]> {
    const data = await apiRequest<BlogListResponse>(API_ENDPOINTS.blog.posts, {}, opts)
    return normalizeBlogPosts(data)
  },

  async getBlogPost(slug: string): Promise<BlogPost> {
    return apiRequest<BlogPost>(API_ENDPOINTS.blog.detail(slug))
  },

  async createBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
    return apiRequest<BlogPost>(API_ENDPOINTS.blog.posts, {
      method: 'POST',
      body: JSON.stringify(post),
    })
  },

  async updateBlogPost(slug: string, post: Partial<BlogPost>): Promise<BlogPost> {
    return apiRequest<BlogPost>(API_ENDPOINTS.blog.detail(slug), {
      method: 'PUT',
      body: JSON.stringify(post),
    })
  },

  // Contacts
  async submitContact(data: ContactSubmission): Promise<ContactSubmission> {
    return apiRequest<ContactSubmission>('/contacts/', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },

  async submitInquiry(formData: FormData): Promise<ContactSubmission> {
    return apiRequest<ContactSubmission>('/contacts/', {
      method: 'POST',
      body: formData,
    })
  },

  async getInquiries(
    params: Record<string, string | number> = {},
    opts: { forwardAuth?: boolean } = {}
  ): Promise<{ results: ContactSubmission[]; count: number }> {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.set(key, String(val))
      }
    })
    const queryStr = query.toString()
    return apiRequest<{ results: ContactSubmission[]; count: number }>(`/contacts/${queryStr ? `?${queryStr}` : ''}`, {}, opts)
  },

  async getInquiry(id: number | string, opts: { forwardAuth?: boolean } = {}): Promise<ContactSubmission> {
    return apiRequest<ContactSubmission>(`/contacts/${id}/`, {}, opts)
  },

  async updateInquiryStatus(id: number | string, status: string): Promise<ContactSubmission> {
    return apiRequest<ContactSubmission>(`/contacts/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  async replyToInquiry(id: number | string, message: string): Promise<InquiryReply> {
    return apiRequest<InquiryReply>(`/contacts/${id}/reply/`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
  },

  async submitQuoteRequest(data: Record<string, unknown>): Promise<void> {
    return apiRequest<void>(API_ENDPOINTS.leads.quoteRequests, {
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

  async getDashboardMetrics<T>(): Promise<T> {
    return apiRequest<T>(API_ENDPOINTS.analytics.dashboardMetrics)
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

  async regenerateProduct(slug: string): Promise<{ status: string; slug: string; detail?: string }> {
    return apiRequest(`/products/${slug}/regenerate/`, { method: 'POST' })
  },

  async regenerateProductsBulk(
    payload: { slugs: string[] } | { all: true }
  ): Promise<{ status: string; count: number; estimated_minutes: number }> {
    return apiRequest('/products/regenerate-bulk/', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  async generateAIProduct(productName: string, category: string): Promise<any> {
    return apiRequest<any>(API_ENDPOINTS.ai.generateProduct, {
      method: 'POST',
      body: JSON.stringify({ product_name: productName, category }),
    })
  },

  async generateAIProductFromForm(payload: FormData | Record<string, any>): Promise<any> {
    return apiRequest<any>(API_ENDPOINTS.ai.generateProduct, {
      method: 'POST',
      body: payload instanceof FormData ? payload : JSON.stringify(payload),
    })
  },

  async analyzeProductImage(formData: FormData): Promise<any> {
    return apiRequest<any>(API_ENDPOINTS.ai.analyzeImage, {
      method: 'POST',
      body: formData,
    })
  },

  async generateAIBlog(topic: string, keywords: string): Promise<any> {
    return apiRequest<any>(API_ENDPOINTS.ai.generateBlog, {
      method: 'POST',
      body: JSON.stringify({ topic, keywords }),
    })
  },

  async getSEOAudit<T>(): Promise<T> {
    return apiRequest<T>('/seo/audit/')
  },

  async getContentQualityAudit<T>(refresh = false): Promise<T> {
    return apiRequest<T>(`/seo/content-quality/${refresh ? '?refresh=1' : ''}`)
  },

  async toggleSavedProduct(productSlug: string): Promise<any> {
    return apiRequest<any>('/products/saved/toggle/', {
      method: 'POST',
      body: JSON.stringify({ product_slug: productSlug }),
    })
  },

  async getSavedProducts(): Promise<any> {
    return apiRequest<any>('/products/saved/')
  },

  async runPerformanceAudit(strategy: 'mobile' | 'desktop' = 'mobile'): Promise<{ status: string; [key: string]: unknown }> {
    return apiRequest('/analytics/performance/run-audit/', {
      method: 'POST',
      body: JSON.stringify({ strategy }),
    })
  },

  async getSystemErrors(params: Record<string, string> = {}): Promise<any> {
    const q = new URLSearchParams(params).toString()
    return apiRequest<any>(`/analytics/errors/${q ? `?${q}` : ''}`)
  },

  async resolveSystemError(id: number): Promise<any> {
    return apiRequest<any>(`/analytics/errors/${id}/resolve/`, { method: 'POST' })
  },

  async resolveAllSystemErrors(): Promise<any> {
    return apiRequest<any>('/analytics/errors/resolve-all/', { method: 'POST' })
  },

  async askKiviAgent(
    message: string,
    sessionId: string,
    history: { role: string; content: string }[] = []
  ): Promise<{
    reply: string
    recommended_products: { name: string; slug: string }[]
    show_contact_options: boolean
    suggest_quote: boolean
  }> {
    return apiRequest(API_ENDPOINTS.ai.kiviAgent, {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId, history }),
    })
  },

  async askAIAssistant(message: string, history: {role: string; content: string}[] = []): Promise<{ response: string; model: string }> {
    return apiRequest<{ response: string; model: string }>('/ai/assistant/', {
      method: 'POST',
      body: JSON.stringify({ message, history }),
    })
  },

  async uploadProductImage(file: File): Promise<{ original_url: string; optimized_url: string; thumbnail_url: string; public_id: string }> {
    const formData = new FormData()
    formData.append('file', file)
    return apiRequest<any>('/products/upload-image/', { method: 'POST', body: formData })
  },

  async getInventoryLogs(): Promise<any> {
    return apiRequest<any>('/products/inventory-logs/')
  },

  async updateStock(slug: string, data: { movement_type: string; quantity: number; reference?: string }): Promise<any> {
    return apiRequest<any>(`/products/${slug}/update-stock/`, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  },
}

