import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Settings,
  Monitor,
  List,
  MapPin,
  Activity,
  FileText,
  BarChart3,
  Bell,
  ChevronLeft,
  ChevronRight,
  Home,
  Target,
  Zap,
  Network,
  Calendar,
  Play,
  AlertTriangle,
  PieChart,
  MessageSquare,
  Bot
} from 'lucide-react';

// 导航菜单结构配置
interface NavigationItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    id: 'dashboard',
    label: '仪表板',
    icon: Home,
    path: '/dashboard',
  },
  {
    id: 'platform-config',
    label: '平台配置',
    icon: Settings,
    children: [
      { id: 'capability-config', label: '能力配置', icon: Zap, path: '/platform-config/capabilities' },
      { id: 'integration', label: '集成支撑', icon: Network, path: '/platform-config/integration' },
      { id: 'capability-test', label: '能力测试', icon: Play, path: '/platform-config/debug' },
    ],
  },
  {
    id: 'device-management',
    label: '设备管理',
    icon: Monitor,
    children: [
      { id: 'device-list', label: '设备列表', icon: Monitor, path: '/devices' },
      { id: 'device-templates', label: '设备模板', icon: FileText, path: '/device-templates' },
      { id: 'device-capabilities', label: '设备能力', icon: Zap, path: '/device-capabilities' },
      { id: 'protocol-interface', label: '协议接口', icon: Network, path: '/devices/protocols' },
      { id: 'inspection-targets', label: '巡检目标设置', icon: Target, path: '/devices/targets' },
    ],
  },
  {
    id: 'planning',
    label: '规划编排',
    icon: MapPin,
    children: [
      { id: 'instant-tasks', label: '即时任务', icon: Play, path: '/planning/instant' },
      { id: 'scheduled-tasks', label: '计划任务', icon: Calendar, path: '/planning/scheduled' },
    ],
  },
  {
    id: 'task-list',
    label: '任务列表',
    icon: List,
    children: [
      { id: 'task-overview', label: '任务概览', icon: List, path: '/tasks' },
      { id: 'status-management', label: '状态管理', icon: Settings, path: '/tasks/status' },
      { id: 'execution-tracking', label: '执行跟踪', icon: Activity, path: '/tasks/tracking' },
    ],
  },
  {
    id: 'process-monitoring',
    label: '过程监控',
    icon: Activity,
    children: [
      { id: 'real-time', label: '实时监控', icon: Activity, path: '/monitoring/real-time' },
      { id: 'data-pool', label: '数据池', icon: BarChart3, path: '/monitoring/data-pool' },
      { id: 'exception-handling', label: '异常处理', icon: AlertTriangle, path: '/monitoring/exceptions' },
    ],
  },
  {
    id: 'diagnostic-reports',
    label: '诊断报告',
    icon: FileText,
    children: [
      { id: 'report-generation', label: '报告生成', icon: FileText, path: '/reports/generation' },
      { id: 'ai-analysis', label: 'AI分析', icon: Bot, path: '/reports/ai-analysis' },
    ],
  },
  {
    id: 'statistics',
    label: '统计分析',
    icon: PieChart,
    children: [
      { id: 'data-stats', label: '数据统计', icon: BarChart3, path: '/statistics/data' },
      { id: 'custom-stats', label: '自定义统计', icon: PieChart, path: '/statistics/custom' },
    ],
  },
  {
    id: 'platform-messages',
    label: '平台消息',
    icon: Bell,
    children: [
      { id: 'message-center', label: '消息中心', icon: Bell, path: '/messages' },
      { id: 'message-management', label: '消息管理', icon: MessageSquare, path: '/messages/management' },
    ],
  },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const isParentActive = (item: NavigationItem): boolean => {
    if (item.path && location.pathname === item.path) {
      return true;
    }
    if (item.children) {
      return item.children.some(child =>
        child.path && location.pathname === child.path
      );
    }
    return false;
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  // 自动展开包含当前活动页面的菜单项
  React.useEffect(() => {
    const newExpanded = new Set<string>();
    navigationItems.forEach(item => {
      if (isParentActive(item)) {
        newExpanded.add(item.id);
      }
    });
    setExpandedItems(newExpanded);
  }, [location.pathname]);

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isItemActive = isParentActive(item);

    return (
      <div key={item.id}>
        {/* 主菜单项 */}
        <div
          className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors cursor-pointer ${
            level > 0 ? 'ml-4' : ''
          } ${
            isItemActive
              ? 'bg-white/20 text-white'
              : 'text-white/80 hover:bg-white/10 hover:text-white'
          } ${collapsed && level === 0 ? 'justify-center px-2' : ''}`}
          onClick={() => {
            if (hasChildren && !collapsed) {
              toggleExpanded(item.id);
            } else if (item.path) {
              // 直接导航（Link 本身处理导航）
            }
          }}
        >
          {item.path ? (
            <Link
              to={item.path}
              className={`flex items-center w-full ${
                collapsed && level === 0 ? 'justify-center' : ''
              }`}
            >
              <item.icon className={`h-5 w-5 ${!collapsed ? 'mr-3' : ''}`} />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {hasChildren && (
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </>
              )}
            </Link>
          ) : (
            <>
              <item.icon className={`h-5 w-5 ${!collapsed ? 'mr-3' : ''}`} />
              {!collapsed && (
                <>
                  <span className="flex-1 truncate">{item.label}</span>
                  {hasChildren && (
                    <ChevronRight
                      className={`h-4 w-4 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  )}
                </>
              )}
            </>
          )}
        </div>

        {/* 子菜单项 */}
        {hasChildren && !collapsed && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map(child => (
              <Link
                key={child.id}
                to={child.path!}
                className={`flex items-center px-3 py-1.5 ml-6 text-xs rounded-md transition-colors ${
                  isActive(child.path!)
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-emerald-50/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <child.icon className="h-4 w-4 mr-2" />
                <span className="truncate">{child.label}</span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      className={`flex flex-col bg-gradient-to-b from-emerald-800 via-emerald-700 to-emerald-600 text-white shadow-lg transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } ${className || ''}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        {!collapsed && (
          <div className="flex items-center">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center shadow-sm">
              <Monitor className="h-5 w-5 text-white" />
            </div>
            <span className="ml-2 text-base font-semibold tracking-wide">
              智慧巡检平台
            </span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigationItems.map(item => renderNavigationItem(item))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <div className="px-4 py-3 border-t border-white/10 text-xs text-emerald-50/80 text-center">
          版本 v1.0.0
        </div>
      )}
    </div>
  );
}
