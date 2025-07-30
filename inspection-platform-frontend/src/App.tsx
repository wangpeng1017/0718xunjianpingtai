import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { router } from './lib/router';
import { useAppStore } from './stores/useAppStore';
import { mockUser } from './mocks/data';

// 创建React Query客户端
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const { setUser } = useAppStore();

  // 初始化用户数据（模拟登录状态）
  React.useEffect(() => {
    // 在实际应用中，这里应该检查token并获取用户信息
    const token = localStorage.getItem('token');
    if (token) {
      setUser(mockUser);
    }
  }, [setUser]);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <RouterProvider router={router} />
      </div>
    </QueryClientProvider>
  );
}

export default App;
