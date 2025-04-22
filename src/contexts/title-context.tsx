'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tạo context để quản lý tiêu đề trang
interface TitleContextType {
  setPageTitle: (title?: string) => void;
}

// Giá trị mặc định cho context
const TitleContext = createContext<TitleContextType>({
  setPageTitle: () => {},
});

// Hook tùy chỉnh để sử dụng title context
export const useTitle = () => useContext(TitleContext);

interface TitleProviderProps {
  children: ReactNode;
  defaultTitle?: string;
}

export function TitleProvider({ 
  children, 
  defaultTitle = 'Hmes-dashboard' 
}: TitleProviderProps) {
  const [title, setTitle] = useState<string>(defaultTitle);

  // Cập nhật tiêu đề khi title thay đổi
  useEffect(() => {
    // Đặt tiêu đề trang
    document.title = title;
    
    // Thêm favicon nếu chưa có
    if (!document.querySelector('link[rel="icon"]')) {
      const link = document.createElement('link');
      link.rel = 'icon';
      link.href = '/favicon.ico';
      document.head.appendChild(link);
    }
  }, [title]);

  // Hàm để các component con gọi để cập nhật tiêu đề
  const setPageTitle = (newTitle?: string) => {
    setTitle(newTitle ? `${newTitle} | ${defaultTitle}` : defaultTitle);
  };

  return (
    <TitleContext.Provider value={{ setPageTitle }}>
      {children}
    </TitleContext.Provider>
  );
} 