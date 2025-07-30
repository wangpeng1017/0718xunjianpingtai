import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Bell, 
  Search, 
  User, 
  Settings, 
  LogOut, 
  ChevronDown,
  Home
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUser, useNotifications, useUnreadCount, useAppStore } from '../../stores/useAppStore';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const location = useLocation();
  const user = useUser();
  const notifications = useNotifications();
  const unreadCount = useUnreadCount();
  const { logout } = useAppStore();
  
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);

  // 生成面包屑导航
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ label: '首页', path: '/' }];

    const pathMap: Record<string, string> = {
      'platform-config': '平台配置',
      'capabilities': '能力配置',
      'integration': '集成支撑',
      'debug': '能力调试',
      'devices': '设备管理',
      'templates': '设备模板',
      'planning': '规划编排',
      'targets': '巡检目标',
      'temp-tasks': '临时任务',
      'scheduled': '计划任务',
      'tasks': '任务列表',
      'monitoring': '过程监控',
      'real-time': '实时监控',
      'data-pool': '数据资源池',
      'exceptions': '异常处理',
      'reports': '诊断报告',
      'generation': '报告生成',
      'ai-analysis': 'AI分析',
      'statistics': '统计分析',
      'data': '数据统计',
      'custom': '定制统计',
      'messages': '平台消息',
      'help': '帮助中心',
    };

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = pathMap[segment] || segment;
      breadcrumbs.push({ label, path: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  const handleLogout = () => {
    logout();
    // 这里可以添加重定向到登录页的逻辑
  };

  return (
    <header className={cn('bg-white border-b border-gray-200 px-6 py-4', className)}>
      <div className="flex items-center justify-between">
        {/* 面包屑导航 */}
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <span className="text-gray-400">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-gray-900 font-medium">{crumb.label}</span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-gray-500 hover:text-gray-900 transition-colors"
                >
                  {index === 0 ? <Home className="h-4 w-4" /> : crumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* 右侧操作区 */}
        <div className="flex items-center space-x-4">
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="搜索设备、任务..."
              className="pl-10 w-64"
            />
          </div>

          {/* 通知中心 */}
          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>

            {/* 通知下拉菜单 */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">通知中心</h3>
                    <Badge variant="secondary">{unreadCount} 未读</Badge>
                  </div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      暂无通知
                    </div>
                  ) : (
                    notifications.slice(0, 5).map(notification => (
                      <div
                        key={notification.id}
                        className={cn(
                          'p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer',
                          !notification.read && 'bg-blue-50'
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={cn(
                            'w-2 h-2 rounded-full mt-2',
                            notification.type === 'error' && 'bg-red-500',
                            notification.type === 'warning' && 'bg-yellow-500',
                            notification.type === 'success' && 'bg-green-500',
                            notification.type === 'info' && 'bg-blue-500'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(notification.timestamp).toLocaleString('zh-CN')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className="p-4 border-t border-gray-200">
                    <Link
                      to="/messages"
                      className="text-sm text-primary hover:text-primary/80 font-medium"
                    >
                      查看全部通知
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 用户菜单 */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2 px-3"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4 text-white" />
                )}
              </div>
              <div className="text-left">
                <div className="text-sm font-medium">{user?.username || '用户'}</div>
                <div className="text-xs text-gray-500">{user?.role || '角色'}</div>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>

            {/* 用户下拉菜单 */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <User className="h-4 w-4 mr-3" />
                    个人资料
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  >
                    <Settings className="h-4 w-4 mr-3" />
                    系统设置
                  </Link>
                  <hr className="my-2" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-3" />
                    退出登录
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
