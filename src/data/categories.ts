export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
}

export const categories: Category[] = [
  { id: 'all', name: '全部', icon: 'Grid3X3', count: 10 },
  { id: 'portrait', name: '人像', icon: 'User', count: 4 },
  { id: 'landscape', name: '风景', icon: 'Mountain', count: 3 },
  { id: 'street', name: '街拍', icon: 'Camera', count: 2 },
  { id: 'commercial', name: '商业', icon: 'Briefcase', count: 2 }
];

export const getCategoryName = (categoryId: string): string => {
  const category = categories.find(cat => cat.id === categoryId);
  return category ? category.name : categoryId;
};
