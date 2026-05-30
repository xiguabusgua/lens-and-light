import { useState, useEffect } from 'react';
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
}: ResponsiveImageProps) {
  const [imageError, setImageError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  const { src: normalSrc, srcSet, sizes: normalSizes } = getResponsiveImage(src);
  
  const currentSrc = imageError ? getFullImageUrl(src) : normalSrc;
  const currentSrcSet = imageError ? '' : srcSet;
  const currentSizes = imageError ? '' : (sizes || normalSizes);

  useEffect(() => {
    setImageError(false);
    setRetryCount(0);
  }, [src]);

  const handleError = () => {
    if (retryCount === 0 && !imageError) {
      setRetryCount(1);
      setImageError(true);
    }
  };

  return (
    <img
      src={currentSrc}
      srcSet={currentSrcSet}
      sizes={currentSizes}
      alt={alt}
      loading={loading}
      className={className}
      draggable={draggable}
      onError={handleError}
      onLoad={onLoad}
      style={style}
      decoding={priority ? 'sync' : 'async'}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}
