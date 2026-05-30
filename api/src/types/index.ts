export interface Work {
  id: number;
  title: string;
  category: string;
  image_url: string;
  thumbnail_url: string | null;
  description: string | null;
  story: string | null;
  camera: string | null;
  lens: string | null;
  aperture: string | null;
  shutter: string | null;
  iso: number | null;
  location: string | null;
  date: string | null;
  featured: number;
  sort_order: number;
  status: 'active' | 'draft' | 'archived';
  tags: string | null;
  tag_list?: Tag[];
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sort_order: number;
  work_count?: number;
  created_at: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  sort_order?: number;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  usage_count: number;
  created_at: string;
}

export interface CreateTagInput {
  name: string;
  slug: string;
}

export interface UpdateTagInput extends Partial<CreateTagInput> {}

export interface CreateWorkInput {
  title: string;
  category: string;
  image_url: string;
  description?: string;
  story?: string;
  camera?: string;
  lens?: string;
  aperture?: string;
  shutter?: string;
  iso?: number;
  location?: string;
  date?: string;
  featured?: boolean;
  sort_order?: number;
  status?: 'active' | 'draft' | 'archived';
  tags?: string[];
  tag_ids?: number[];
}

export interface UpdateWorkInput extends Partial<CreateWorkInput> {
  thumbnail_url?: string;
}

export interface ReorderItem {
  id: number;
  sort_order: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: number;
    username: string;
  };
}

export interface LoginInput {
  username: string;
  password: string;
}

export interface UploadResponse {
  success: boolean;
  url: string;
  filename: string;
}

export interface Album {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  cover_url: string | null;
  status: 'active' | 'draft' | 'hidden';
  sort_order: number;
  work_count?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAlbumInput {
  title: string;
  slug: string;
  description?: string;
  cover_url?: string;
  status?: 'active' | 'draft' | 'hidden';
  sort_order?: number;
}

export interface UpdateAlbumInput extends Partial<CreateAlbumInput> {}

export interface JwtPayload {
  id: number;
  username: string;
  iat?: number;
  exp?: number;
}
