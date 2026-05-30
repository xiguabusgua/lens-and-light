import type { Work } from '@/data/works';

export interface AdminWork extends Work {
  status: 'active' | 'draft' | 'featured';
  sort_order: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface LoginFormData {
  username: string;
  password: string;
}

export interface WorkFormData {
  title: string;
  category: 'portrait' | 'landscape' | 'street' | 'commercial';
  description: string;
  story: string;
  imageUrl: string;
  camera: string;
  lens: string;
  aperture: string;
  shutter: string;
  iso: number | '';
  location: string;
  date: string;
  featured: boolean;
  sortOrder: number;
  tags: string;
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export interface DashboardStats {
  totalWorks: number;
  featuredWorks: number;
  categoriesCount: number;
  totalViews: number;
}
