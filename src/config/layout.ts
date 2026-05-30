export type LayoutMode = 'auto-scroll' | 'masonry' | 'grid' | 'carousel' | 'single' | 'timeline';

export interface LayoutConfig {
  mode: LayoutMode;
  columns: number;
  gap: number;
}

export const layoutModes: { value: LayoutMode; label: string; description: string; icon: string }[] = [
  {
    value: 'auto-scroll',
    label: '自动滚动列',
    description: '多列自动向下滚动，鼠标悬停暂停，适合沉浸式浏览',
    icon: '📜'
  },
  {
    value: 'masonry',
    label: '瀑布流网格',
    description: '不规则高度的瀑布流布局，适合不同比例的图片',
    icon: '🧱'
  },
  {
    value: 'grid',
    label: '规则网格',
    description: '等高等宽的整齐网格，适合统一风格展示',
    icon: '⬜'
  },
  {
    value: 'carousel',
    label: '横向轮播',
    description: '水平滑动展示作品，左右翻页浏览',
    icon: '🎠'
  },
  {
    value: 'single',
    label: '单列大图',
    description: '每行一个作品，大图展示，突出细节',
    icon: '🖼'
  },
  {
    value: 'timeline',
    label: '时间线',
    description: '按时间顺序排列作品，追溯创作历程',
    icon: '⏳'
  }
];

export const defaultLayoutConfig: LayoutConfig = {
  mode: 'auto-scroll',
  columns: 4,
  gap: 16
};

const STORAGE_KEY = 'portfolio_layout_config';

export function getLayoutConfig(): LayoutConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...defaultLayoutConfig, ...JSON.parse(stored) };
    }
  } catch {
    // ignore
  }
  return defaultLayoutConfig;
}

export function saveLayoutConfig(config: Partial<LayoutConfig>): LayoutConfig {
  const current = getLayoutConfig();
  const merged = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('layout-config-change'));
  } catch {
    // ignore
  }
  return merged;
}

export function resetLayoutConfig(): LayoutConfig {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  return defaultLayoutConfig;
}
