import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';

// 导入实际的组件
const Dashboard = React.lazy(() => import('../features/dashboard/Dashboard'));
const DeviceList = React.lazy(() => import('../features/devices/DeviceList'));
const DeviceTemplates = React.lazy(() => import('../features/devices/DeviceTemplates'));
const DeviceCapabilities = React.lazy(() => import('../features/devices/DeviceCapabilities'));
const ProtocolInterface = React.lazy(() => import('../features/devices/ProtocolInterface'));
const CapabilityConfiguration = React.lazy(() => import('../features/configuration/CapabilityConfiguration'));
const IntegrationDependencies = React.lazy(() => import('../features/integration/IntegrationDependencies'));
const CapabilityTesting = React.lazy(() => import('../features/testing/CapabilityTesting'));
const TaskList = React.lazy(() => import('../features/tasks/TaskList'));
const InstantTasks = React.lazy(() => import('../features/planning/InstantTasks'));
const ScheduledTasks = React.lazy(() => import('../features/planning/ScheduledTasks'));
const InspectionTargets = React.lazy(() => import('../features/planning/InspectionTargets'));
const TaskStatusManagement = React.lazy(() => import('../features/tasks/TaskStatusManagement'));
const ExecutionTracking = React.lazy(() => import('../features/monitoring/ExecutionTracking'));
const RealTimeMonitoring = React.lazy(() => import('../features/monitoring/RealTimeMonitoring'));
const DiagnosticReports = React.lazy(() => import('../features/reports/DiagnosticReports'));
const StatisticsAnalysis = React.lazy(() => import('../features/analytics/StatisticsAnalysis'));
const PlatformMessages = React.lazy(() => import('../features/messages/PlatformMessages'));
const ExceptionHandling = React.lazy(() => import('../features/monitoring/ExceptionHandling'));
const DataPool = React.lazy(() => import('../features/monitoring/DataPool'));
const RouteOptimization = React.lazy(() => import('../features/planning/RouteOptimization'));
const TaskScheduling = React.lazy(() => import('../features/planning/TaskScheduling'));
const AIAnalysis = React.lazy(() => import('../features/reports/AIAnalysis'));
const CustomReports = React.lazy(() => import('../features/analytics/CustomReports'));
const MessageTemplates = React.lazy(() => import('../features/messages/MessageTemplates'));
const DeviceMaintenance = React.lazy(() => import('../features/devices/DeviceMaintenance'));
const TaskWorkflow = React.lazy(() => import('../features/tasks/TaskWorkflow'));
const SystemSettings = React.lazy(() => import('../features/config/SystemSettings'));
const DataStreamMonitor = React.lazy(() => import('../features/monitoring/DataStreamMonitor'));
const AdvancedDiagnostics = React.lazy(() => import('../features/reports/AdvancedDiagnostics'));
const PathOptimization = React.lazy(() => import('../features/planning/PathOptimization'));

// 占位页面组件
const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
      <p className="text-gray-600 mt-1">{description}</p>
    </div>

    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="text-center py-12">
        <p className="text-gray-500">此功能正在开发中...</p>
        <p className="text-sm text-gray-400 mt-2">敬请期待更多功能</p>
      </div>
    </div>
  </div>
);




// 加载组件包装器
const LoadingWrapper = ({ children }: { children: React.ReactNode }) => (
  <React.Suspense
    fallback={
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    }
  >
    {children}
  </React.Suspense>
);

export const router = createBrowserRouter([
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
        element: (
          <LoadingWrapper>
            <Dashboard />
          </LoadingWrapper>
        ),
      },
      // 平台配置
      {
        path: 'platform-config/capabilities',
        element: (
          <LoadingWrapper>
            <CapabilityConfiguration />
          </LoadingWrapper>
        ),
      },
      {
        path: 'platform-config/integration',
        element: (
          <LoadingWrapper>
            <IntegrationDependencies />
          </LoadingWrapper>
        ),
      },
      {
        path: 'platform-config/debug',
        element: (
          <LoadingWrapper>
            <CapabilityTesting />
          </LoadingWrapper>
        ),
      },
      {
        path: 'platform-config/system',
        element: (
          <LoadingWrapper>
            <SystemSettings />
          </LoadingWrapper>
        ),
      },

      // 设备管理
      {
        path: 'devices',
        element: (
          <LoadingWrapper>
            <DeviceList />
          </LoadingWrapper>
        ),
      },
      {
        path: 'device-templates',
        element: (
          <LoadingWrapper>
            <DeviceTemplates />
          </LoadingWrapper>
        ),
      },
      {
        path: 'device-capabilities',
        element: (
          <LoadingWrapper>
            <DeviceCapabilities />
          </LoadingWrapper>
        ),
      },
      {
        path: 'devices/protocols',
        element: (
          <LoadingWrapper>
            <ProtocolInterface />
          </LoadingWrapper>
        ),
      },
      {
        path: 'devices/targets',
        element: (
          <LoadingWrapper>
            <InspectionTargets />
          </LoadingWrapper>
        ),
      },
      {
        path: 'devices/maintenance',
        element: (
          <LoadingWrapper>
            <DeviceMaintenance />
          </LoadingWrapper>
        ),
      },

      // 规划编排
      {
        path: 'planning/instant',
        element: (
          <LoadingWrapper>
            <InstantTasks />
          </LoadingWrapper>
        ),
      },
      {
        path: 'planning/scheduled',
        element: (
          <LoadingWrapper>
            <ScheduledTasks />
          </LoadingWrapper>
        ),
      },
      {
        path: 'planning/route-optimization',
        element: (
          <LoadingWrapper>
            <RouteOptimization />
          </LoadingWrapper>
        ),
      },
      {
        path: 'planning/task-scheduling',
        element: (
          <LoadingWrapper>
            <TaskScheduling />
          </LoadingWrapper>
        ),
      },
      {
        path: 'planning/path-optimization',
        element: (
          <LoadingWrapper>
            <PathOptimization />
          </LoadingWrapper>
        ),
      },

      // 任务列表
      {
        path: 'tasks',
        element: (
          <LoadingWrapper>
            <TaskList />
          </LoadingWrapper>
        ),
      },
      {
        path: 'tasks/status',
        element: (
          <LoadingWrapper>
            <TaskStatusManagement />
          </LoadingWrapper>
        ),
      },
      {
        path: 'tasks/tracking',
        element: (
          <LoadingWrapper>
            <ExecutionTracking />
          </LoadingWrapper>
        ),
      },
      {
        path: 'tasks/workflow',
        element: (
          <LoadingWrapper>
            <TaskWorkflow />
          </LoadingWrapper>
        ),
      },

      // 过程监控
      {
        path: 'monitoring/real-time',
        element: (
          <LoadingWrapper>
            <RealTimeMonitoring />
          </LoadingWrapper>
        ),
      },
      {
        path: 'monitoring/data-pool',
        element: (
          <LoadingWrapper>
            <DataPool />
          </LoadingWrapper>
        ),
      },
      {
        path: 'monitoring/exceptions',
        element: (
          <LoadingWrapper>
            <ExceptionHandling />
          </LoadingWrapper>
        ),
      },
      {
        path: 'monitoring/datastream',
        element: (
          <LoadingWrapper>
            <DataStreamMonitor />
          </LoadingWrapper>
        ),
      },

      // 诊断报告
      {
        path: 'reports/generation',
        element: (
          <LoadingWrapper>
            <DiagnosticReports />
          </LoadingWrapper>
        ),
      },
      {
        path: 'reports/ai-analysis',
        element: (
          <LoadingWrapper>
            <AIAnalysis />
          </LoadingWrapper>
        ),
      },
      {
        path: 'reports/advanced',
        element: (
          <LoadingWrapper>
            <AdvancedDiagnostics />
          </LoadingWrapper>
        ),
      },

      // 统计分析
      {
        path: 'statistics/data',
        element: (
          <LoadingWrapper>
            <StatisticsAnalysis />
          </LoadingWrapper>
        ),
      },
      {
        path: 'statistics/custom',
        element: (
          <LoadingWrapper>
            <CustomReports />
          </LoadingWrapper>
        ),
      },

      // 平台消息
      {
        path: 'messages',
        element: (
          <LoadingWrapper>
            <PlatformMessages />
          </LoadingWrapper>
        ),
      },
      {
        path: 'messages/templates',
        element: (
          <LoadingWrapper>
            <MessageTemplates />
          </LoadingWrapper>
        ),
      },
      // 404页面
      {
        path: '*',
        element: <Navigate to="/dashboard" replace />,
      },
    ],
  },
]);
