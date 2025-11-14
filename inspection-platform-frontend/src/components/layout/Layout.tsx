import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useSidebarCollapsed } from '../../stores/useAppStore';
import { cn } from '../../lib/utils';

export function Layout() {
  const collapsed = useSidebarCollapsed();

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 侧边栏 */}
      <Sidebar />
      
      {/* 主内容区 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* 顶部导航 */}
        <Header />
        
        {/* 页面内容 */}
        <main 
          className={cn(
            'flex-1 overflow-auto transition-all duration-300',
            'min-w-0' // 防止内容溢出
          )}
        >
          {/* 全宽内容区域，靠近设计图的布局 */}
          <div className="px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
