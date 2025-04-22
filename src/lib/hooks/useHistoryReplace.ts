import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

/**
 * Hook tùy chỉnh để thực hiện chuyển trang mà không thay đổi URL hiển thị
 * Sử dụng History API để duy trì URL hiện tại và Next.js router để điều hướng
 */
export function useHistoryReplace() {
  const router = useRouter();

  const navigateSilently = useCallback((path: string) => {
    if (!path) return;
    
    // Lưu URL hiện tại vào history API
    window.history.replaceState({}, '', '/');
    
    // Chuyển trang trong ứng dụng
    router.push(path);
  }, [router]);

  return navigateSilently;
} 