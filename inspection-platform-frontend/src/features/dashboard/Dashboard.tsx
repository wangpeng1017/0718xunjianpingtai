import React from 'react';
import { 
  Monitor, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  TrendingUp,
  MapPin,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useDevices } from '../../stores/useDeviceStore';
import { useTasks } from '../../stores/useTaskStore';
import { mockStatistics, generateTimeSeriesData } from '../../mocks/data';
import { formatNumber, getStatusColor } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: 'up' | 'down' | 'neutral';
}

function StatCard({ title, value, change, icon: Icon, trend = 'neutral' }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className={`text-xs flex items-center mt-1 ${
            trend === 'up' ? 'text-green-600' : 
            trend === 'down' ? 'text-red-600' : 
            'text-gray-600'
          }`}>
            {trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function Dashboard() {
  const devices = useDevices();
  const tasks = useTasks();
  const [timeSeriesData] = React.useState(() => generateTimeSeriesData(7));

  // 计算统计数据
  const deviceStats = React.useMemo(() => {
    const total = devices.length;
    const online = devices.filter(d => d.status === 'online').length;
    const offline = devices.filter(d => d.status === 'offline').length;
    const maintenance = devices.filter(d => d.status === 'maintenance').length;
    
    return { total, online, offline, maintenance };
  }, [devices]);

  const taskStats = React.useMemo(() => {
    const total = tasks.length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const running = tasks.filter(t => t.status === 'running').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    
    return { total, pending, running, completed, failed };
  }, [tasks]);

  // 最近的任务
  const recentTasks = React.useMemo(() => {
    return tasks
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [tasks]);

  // 设备状态分布
  const deviceStatusData = React.useMemo(() => {
    return [
      { name: '在线', value: deviceStats.online, color: '#10b981' },
      { name: '离线', value: deviceStats.offline, color: '#ef4444' },
      { name: '维护', value: deviceStats.maintenance, color: '#f59e0b' },
    ];
  }, [deviceStats]);

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">仪表板</h1>
          <p className="text-gray-600 mt-1">智慧巡检平台概览</p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <MapPin className="h-4 w-4 mr-2" />
            实时地图
          </Button>
          <Button>
            <Zap className="h-4 w-4 mr-2" />
            创建任务
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="设备总数"
          value={deviceStats.total}
          change="+2 较昨日"
          icon={Monitor}
          trend="up"
        />
        <StatCard
          title="在线设备"
          value={deviceStats.online}
          change={`${Math.round((deviceStats.online / deviceStats.total) * 100)}% 在线率`}
          icon={CheckCircle}
          trend="up"
        />
        <StatCard
          title="进行中任务"
          value={taskStats.running}
          change="+5 较昨日"
          icon={Activity}
          trend="up"
        />
        <StatCard
          title="今日完成"
          value={taskStats.completed}
          change="92% 成功率"
          icon={CheckCircle}
          trend="up"
        />
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 设备状态概览 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>设备状态概览</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceStatusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">{item.value}</span>
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          backgroundColor: item.color,
                          width: `${(item.value / deviceStats.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 快速操作 */}
        <Card>
          <CardHeader>
            <CardTitle>快速操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Monitor className="h-4 w-4 mr-2" />
              添加设备
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              创建巡检任务
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MapPin className="h-4 w-4 mr-2" />
              设置巡检目标
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <AlertTriangle className="h-4 w-4 mr-2" />
              查看异常
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* 最近任务和系统状态 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近任务 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>最近任务</CardTitle>
            <Button variant="ghost" size="sm">查看全部</Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {task.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {task.deviceName} • {new Date(task.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={
                        task.status === 'completed' ? 'success' :
                        task.status === 'running' ? 'default' :
                        task.status === 'failed' ? 'error' :
                        'secondary'
                      }
                    >
                      {task.status === 'completed' ? '已完成' :
                       task.status === 'running' ? '进行中' :
                       task.status === 'failed' ? '失败' :
                       task.status === 'pending' ? '待执行' : '已取消'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 系统状态 */}
        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">CPU使用率</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">内存使用率</span>
                <span className="text-sm font-medium">62%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '62%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">存储使用率</span>
                <span className="text-sm font-medium">78%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '78%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">网络延迟</span>
                <span className="text-sm font-medium">12ms</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Dashboard;
