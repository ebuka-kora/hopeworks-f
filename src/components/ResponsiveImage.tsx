import React from 'react';

const REMOTE_WIDTHS = [640, 1200, 1920, 2560, 3840] as const;
const DEFAULT_REMOTE_WIDTH = 2560;

function isResizableRemoteUrl(url: string): boolean {
  return (
    url.includes('images.unsplash.com') ||
    url.includes('picsum.photos') ||
    /[?&]w=\d+/.test(url)
  );
}

function setWidthParam(url: string, width: number): string {
  if (url.includes('images.unsplash.com')) {
    const parsed = new URL(url);
    parsed.searchParams.set('w', String(width));
    parsed.searchParams.set('auto', 'format');
    parsed.searchParams.set('fit', 'crop');
    parsed.searchParams.set('q', '90');
    return parsed.toString();
  }
  if (url.includes('picsum.photos')) {
    const base = url.split('?')[0];
    return `${base}?w=${width}`;
  }
  if (/[?&]w=\d+/.test(url)) {
    return url.replace(/([?&]w=)\d+/, `$1${width}`);
  }
  return url;
}

function buildSrcSet(src: string): string | undefined {
  if (!isResizableRemoteUrl(src)) return undefined;
  return REMOTE_WIDTHS.map((w) => `${setWidthParam(src, w)} ${w}w`).join(', ');
}

export interface ResponsiveImageProps extends Omit<React.ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'sizes'> {
  src: string;
  alt: string;
  sizes?: string;
  aspectRatio?: `${number}/${number}` | `${number}`;
  priority?: boolean;
}

export function ResponsiveImage({
  src,
  alt,
  sizes = '100vw',
  aspectRatio,
  priority = false,
  className = '',
  width,
  height,
  ...rest
}: ResponsiveImageProps) {
  const srcSet = buildSrcSet(src);
  const defaultSrc = isResizableRemoteUrl(src) ? setWidthParam(src, DEFAULT_REMOTE_WIDTH) : src;

  let intrinsicWidth = width;
  let intrinsicHeight = height;
  if (aspectRatio && !intrinsicWidth && !intrinsicHeight) {
    const [w, h] = aspectRatio.split('/').map(Number);
    if (w && h) {
      intrinsicWidth = w * 100;
      intrinsicHeight = h * 100;
    }
  }

  return (
    <img
      src={defaultSrc}
      srcSet={srcSet}
      sizes={srcSet ? sizes : undefined}
      alt={alt}
      width={intrinsicWidth}
      height={intrinsicHeight}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : undefined}
      className={className}
      {...rest}
    />
  );
}
