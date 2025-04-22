'use client';

import { useEffect } from 'react';
import { useTitle } from '@/contexts/title-context';

/**
 * Hook tùy chỉnh để đặt tiêu đề cho trang web
 * @param title Tiêu đề trang (sẽ tự động ghép với tên ứng dụng)
 */
export default function usePageTitle(title?: string) {
  const { setPageTitle } = useTitle();
  
  useEffect(() => {
    // Sử dụng context để đặt tiêu đề
    setPageTitle(title);

    // Trả về hàm cleanup trong trường hợp component bị unmount
    return () => {
      // Đặt lại tiêu đề mặc định khi unmount
      setPageTitle();
    };
  }, [title, setPageTitle]);
} 