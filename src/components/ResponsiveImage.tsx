import { useState, useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { getFullImageUrl, getResponsiveImage } from '@/lib/utils';

interface ResponsiveImageProps {
  src: string | null;
  alt: string;
  className?: string;
  loading?: 'lazy' | 'eager';
  draggable?: boolean;
  sizes?: string;
  priority?: boolean;
  onLoad?: () => void;
  style?: React.CSSProperties;
  /** 低分辨率 blur-up 图源，默认用 thumbnail_url 或原图本身 */
  blurSrc?: string | null;
}

export default function ResponsiveImage({
  src,
  alt,
  className = 'w-full h-full object-cover',
  loading = 'lazy',
  draggable = false,
  sizes,
  priority = false,
  onLoad,
  style,
  blurSrc,
}: ResponsiveImageProps) {
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  const { src: normalSrc, srcSet, sizes: normalSizes } = getResponsiveImage(src);

  const currentSrc = imageError ? getFullImageUrl(src) : normalSrc;
  const currentSrcSet = imageError ? '' : srcSet;
  const currentSizes = sizes || normalSizes;

  // blur-up: 拿 blurSrc，没传就用 thumbnail 低质量本身
  const blurUrl = getFullImageUrl(blurSrc ?? src);

  // Intersection Observer：只在进入视口时开始加载（非 priority 图）
  const { ref: inViewRef, inView } = useInView({
    triggerOnce: true,
    rootMargin: '200px',
    skip: priority,
  });

  const shouldLoad = priority || inView;

  useEffect(() => {
    setImageError(false);
    setRetryCount(0);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    if (retryCount === 0 && !imageError) {
      setRetryCount(1);
      setImageError(true);
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  return (
    <div
      ref={inViewRef}
      className="relative overflow-hidden"
      style={style}
    >
      {/* Blur-up placeholder */}
      {shouldLoad && blurUrl && (
        <img
          src={blurUrl}
          alt=""
          aria-hidden="true"
          className={`absolute inset-0 w-full h-full object-cover ${className} transition-opacity duration-500`}
          style={{
            filter: 'blur(20px)',
            transform: 'scale(1.08)',
            opacity: isLoaded ? 0 : 1,
            zIndex: 1,
          }}
          loading="eager"
        />
      )}

      {/* 主图 */}
      {shouldLoad && (
        <img
          src={currentSrc}
          srcSet={currentSrcSet}
          sizes={currentSizes}
          alt={alt}
          loading={priority ? 'eager' : loading}
          className={`${className} transition-opacity duration-500`}
          style={{
            opacity: isLoaded ? 1 : 0,
            zIndex: 2,
          }}
          draggable={draggable}
          onError={handleError}
          onLoad={handleLoad}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
      )}

      {/* 未进入视口时显示占位背景 */}
      {!shouldLoad && (
        <div className={`${className} bg-surface`} style={{ zIndex: 0 }} />
      )}
    </div>
  );
}
