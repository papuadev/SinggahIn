/**
 * Utility to optimize remote image delivery (Cloudinary).
 */

function transformCloudinaryUrl(url: string, width: number, height?: number): string {
  if (url.includes('/upload/c_') || url.includes('/upload/w_') || url.includes('/upload/f_auto')) {
    return url;
  }
  const params = height ? `c_fill,w_${width},h_${height},f_auto,q_auto/` : `c_limit,w_${width},f_auto,q_auto/`;
  return url.replace('/upload/', `/upload/${params}`);
}

export function optimizeImageUrl(
  url: string | null | undefined,
  width = 600,
  height?: number
): string {
  if (!url) return '';
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    return transformCloudinaryUrl(url, width, height);
  }
  return url;
}
