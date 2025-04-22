'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CircularProgress, Box } from '@mui/material';

export default function Page() {
  const router = useRouter();
  
  useEffect(() => {
    // Chuyển đến dashboard mà không thay đổi URL
    router.replace('/dashboard');
    
    // Thêm một listener để đảm bảo URL luôn được giữ nguyên
    const handleRouteChange = () => {
      // Sử dụng timeout để đảm bảo chạy sau khi chuyển trang hoàn tất
      setTimeout(() => {
        window.history.replaceState({}, '', '/');
      }, 0);
    };

    window.addEventListener('popstate', handleRouteChange);
    
    // Ghi đè URL ngay lập tức
    window.history.replaceState({}, '', '/');
    
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [router]);

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Box>
  );
}
