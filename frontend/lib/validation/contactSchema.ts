import { z } from 'zod'

export const INQUIRY_TYPES = [
  { value: 'quotation', label: 'Request Quotation' },
  { value: 'product_info', label: 'Product Information' },
  { value: 'technical_support', label: 'Technical Support' },
  { value: 'bulk_order', label: 'Bulk Order' },
  { value: 'partnership', label: 'Partnership Inquiry' },
  { value: 'general', label: 'General Inquiry' },
] as const

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  company_name: z.string().min(1, 'Company name is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(6, 'Phone number is required'),
  country: z.string().min(1, 'Country is required'),
  inquiry_type: z.enum([
    'quotation',
    'product_info',
    'technical_support',
    'bulk_order',
    'partnership',
    'general',
  ]),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Please provide a few more details'),
  product_interest: z.string().optional(),
  quantity: z.string().optional(),
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

export const MAX_ATTACHMENT_SIZE = 5 * 1024 * 1024 // 5MB
export const ALLOWED_ATTACHMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.jpg', '.jpeg', '.png', '.webp']

export function validateAttachment(file: File): string | null {
  const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
  if (!ALLOWED_ATTACHMENT_EXTENSIONS.includes(ext)) {
    return 'Unsupported file type. Allowed: PDF, Word, Excel, JPG, PNG, WEBP.'
  }
  if (file.size > MAX_ATTACHMENT_SIZE) {
    return 'File too large — maximum size is 5MB.'
  }
  return null
}
