import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';

// 简单的Dashboard组件
const SimpleDashboard = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">仪表板</h1>
      <p className="text-gray-600 mt-1">智慧巡检平台概览</p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">设备总数</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">30</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">在线设备</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">24</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">进行中任务</h3>
        <p className="text-3xl font-bold text-purple-600 mt-2">8</p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900">今日完成</h3>
        <p className="text-3xl font-bold text-orange-600 mt-2">15</p>
      </div>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
          <h4 className="font-medium text-blue-900">设备管理</h4>
          <p className="text-sm text-blue-700 mt-1">管理和监控设备</p>
        </button>
        <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
          <h4 className="font-medium text-green-900">任务管理</h4>
          <p className="text-sm text-green-700 mt-1">创建和管理任务</p>
        </button>
        <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
          <h4 className="font-medium text-purple-900">平台配置</h4>
          <p className="text-sm text-purple-700 mt-1">能力配置和编排</p>
        </button>
        <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors">
          <h4 className="font-medium text-orange-900">实时监控</h4>
          <p className="text-sm text-orange-700 mt-1">实时监控和分析</p>
        </button>
      </div>
    </div>
  </div>
);

// 简单的设备页面
const SimpleDevices = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">设备管理</h1>
      <p className="text-gray-600 mt-1">管理和监控所有巡检设备</p>
    </div>
    
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">设备列表</h3>
      </div>
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">设备管理功能正在加载...</p>
          <p className="text-sm text-gray-400 mt-2">包含30个Mock设备的完整管理功能</p>
        </div>
      </div>
    </div>
  </div>
);

// 简单的任务页面
const SimpleTasks = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">任务管理</h1>
      <p className="text-gray-600 mt-1">管理和监控所有巡检任务</p>
    </div>
    
    <div className="bg-white rounded-lg shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold">任务列表</h3>
      </div>
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">任务管理功能正在加载...</p>
          <p className="text-sm text-gray-400 mt-2">包含100个Mock任务的完整管理功能</p>
        </div>
      </div>
    </div>
  </div>
);

export const simpleRouter = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <SimpleDashboard />,
      },
      {
        path: 'devices',
        element: <SimpleDevices />,
      },
      {
        path: 'tasks',
        element: <SimpleTasks />,
      },
      // 其他路由暂时重定向到仪表板
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
