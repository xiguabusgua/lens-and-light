import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const API_BASE = import.meta.env.DEV
  ? 'http://localhost:3002'
  : import.meta.env.VITE_API_BASE_URL || ''

export function getFullImageUrl(url: string | null): string {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  if (url.startsWith('/')) return `${API_BASE}${url}`
  return url
}

const categoryLabelMap: Record<string, string> = {
  landscape: '风光',
  portrait: '人像',
  street: '街拍',
  commercial: '商业',
  documentary: '纪实'
}

export function getCategoryLabel(cat: string): string {
  return categoryLabelMap[cat] || cat
}

export interface ApiWork {
  id: number
  title: string
  category: string
  image_url: string
  thumbnail_url: string | null
  description: string | null
  story: string | null
  camera: string | null
  lens: string | null
  aperture: string | null
  shutter: string | null
  iso: number | null
  location: string | null
  date: string | null
  featured: number
  status: string
  sort_order: number
  created_at: string
  tag_list: Array<{ id: number; name: string; slug: string }>
}

export interface ApiAlbum {
  id: number
  title: string
  slug: string
  description: string | null
  cover_url: string | null
  is_featured: number
  sort_order: number
  created_at: string
  updated_at: string
  photo_count?: number
}

export function handleApiError(error: unknown, fallback: string = '请求失败，请稍后重试'): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: string } }; message?: string }
    return axiosError.response?.data?.error || axiosError.message || fallback
  }
  if (error instanceof Error) return error.message
  return fallback
}

export function formatDate(dateStr: string, includeTime = false): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  if (includeTime) {
    const h = String(d.getHours()).padStart(2, '0');
    const min = String(d.getMinutes()).padStart(2, '0');
    return `${y}-${m}-${day} ${h}:${min}`;
  }
  return `${y}-${m}-${day}`;
}

export function formatMonth(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}年${d.getMonth() + 1}月`;
}

const RESPONSIVE_WIDTHS = [400, 800, 1200] as const;

export function getResponsiveImage(rawUrl: string | null): {
  src: string
  srcSet: string
  sizes: string
} {
  const src = getFullImageUrl(rawUrl);
  if (!src || !src.startsWith(API_BASE) || src.includes('/api/images/')) {
    return { src, srcSet: '', sizes: '' };
  }

  const urlPath = src.replace(API_BASE, '');

  const srcSetParts = RESPONSIVE_WIDTHS.map(w =>
    `${API_BASE}/api/images/thumb?url=${encodeURIComponent(urlPath)}&w=${w}&fmt=webp ${w}w`
  );

  return {
    src,
    srcSet: srcSetParts.join(', '),
    sizes: '(max-width: 640px) 400px, (max-width: 1024px) 800px, 1200px',
  };
}
