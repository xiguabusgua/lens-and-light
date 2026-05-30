import { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Navbar } from './layout/Navbar';
import { Footer } from './layout/Footer';
import { ScrollProgress } from './layout/ScrollProgress';
import { CustomCursor } from './layout/CustomCursor';
import { PageTransition } from './layout/PageTransition';

interface PageMeta {
  title: string;
  description: string;
}

const SITE_NAME = 'Lens & Light';
const BASE_URL = 'https://lensandlight.com';

const pageMetaMap: Record<string, PageMeta> = {
  '/': {
    title: `${SITE_NAME} | 摄影作品集`,
    description: '专业摄影师个人作品集 - 用镜头捕捉生活中的艺术瞬间。风光、人像、街拍、商业摄影作品在线展示。'
  },
  '/portfolio': {
    title: `作品集 | ${SITE_NAME}`,
    description: '浏览全部摄影作品 - 风光、人像、街拍、商业等分类，用光影书写视觉诗篇。'
  },
  '/about': {
    title: `关于我 | ${SITE_NAME}`,
    description: '了解摄影师的故事、创作理念、设备清单与拍摄经历。'
  },
  '/albums': {
    title: `相册集 | ${SITE_NAME}`,
    description: '按主题分类的摄影相册集合，每组照片讲述一个完整的故事。'
  },
};

function getPageMeta(pathname: string): PageMeta {
  if (pageMetaMap[pathname]) return pageMetaMap[pathname];

  if (pathname.startsWith('/portfolio/')) {
    return { title: `作品集 | ${SITE_NAME}`, description: '按分类浏览摄影作品。' };
  }
  if (pathname.startsWith('/work/')) {
    return { title: `作品详情 | ${SITE_NAME}`, description: '摄影作品详细信息与拍摄参数。' };
  }
  if (pathname.startsWith('/albums/')) {
    return { title: `相册详情 | ${SITE_NAME}`, description: '浏览摄影专辑中的精彩作品。' };
  }
  if (pathname.startsWith('/gallery/')) {
    return { title: `作品浏览 | ${SITE_NAME}`, description: '全屏沉浸式欣赏摄影作品。' };
  }

  return { title: `${SITE_NAME} | 摄影作品集`, description: '专业摄影师个人作品集。' };
}

export function FrontLayout() {
  const location = useLocation();
  const meta = useMemo(() => getPageMeta(location.pathname), [location.pathname]);

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={`${BASE_URL}${location.pathname}`} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />
        <link rel="canonical" href={`${BASE_URL}${location.pathname}`} />
      </Helmet>
      <ScrollProgress />
      <CustomCursor />
      <Navbar />
      <PageTransition>
        <Outlet />
      </PageTransition>
      <Footer />
    </>
  );
}
