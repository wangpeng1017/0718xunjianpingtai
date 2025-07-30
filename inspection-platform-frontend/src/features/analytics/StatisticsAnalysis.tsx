import React, { useState } from 'react';
import {
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Zap,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Form';
import { formatRelativeTime } from '../../lib/utils';

// 统计数据类型定义
interface StatisticsData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    failedTasks: number;
    successRate: number;
    avgDuration: number;
    totalDevices: number;
    activeDevices: number;
    totalTargets: number;
    issuesFound: number;
    criticalIssues: number;
  };
  trends: {
    period: string;
    tasks: number;
    successRate: number;
    avgDuration: number;
    issues: number;
  }[];
  devicePerformance: {
    deviceId: string;
    deviceName: string;
    tasksCompleted: number;
    successRate: number;
    avgDuration: number;
    uptime: number;
    lastMaintenance: string;
    status: 'active' | 'inactive' | 'maintenance';
  }[];
  targetAnalysis: {
    targetId: string;
    targetName: string;
    inspectionCount: number;
    issuesFound: number;
    avgDuration: number;
    lastInspection: string;
    riskLevel: 'low' | 'medium' | 'high' | 'critical';
  }[];
  issueCategories: {
    category: string;
    count: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  }[];
  timeDistribution: {
    hour: number;
    taskCount: number;
    successRate: number;
  }[];
  operatorPerformance: {
    operatorId: string;
    operatorName: string;
    tasksAssigned: number;
    tasksCompleted: number;
    successRate: number;
    avgResponseTime: number;
  }[];
}

// Mock数据
const mockStatistics: StatisticsData = {
  overview: {
    totalTasks: 1247,
    completedTasks: 1156,
    failedTasks: 91,
    successRate: 92.7,
    avgDuration: 34.5,
    totalDevices: 12,
    activeDevices: 10,
    totalTargets: 45,
    issuesFound: 156,
    criticalIssues: 23
  },
  trends: [
    { period: '2024-07-01', tasks: 42, successRate: 89.5, avgDuration: 36.2, issues: 8 },
    { period: '2024-07-02', tasks: 38, successRate: 92.1, avgDuration: 34.8, issues: 6 },
    { period: '2024-07-03', tasks: 45, successRate: 91.1, avgDuration: 35.5, issues: 7 },
    { period: '2024-07-04', tasks: 41, successRate: 93.7, avgDuration: 33.2, issues: 5 },
    { period: '2024-07-05', tasks: 39, successRate: 94.9, avgDuration: 32.8, issues: 4 },
    { period: '2024-07-06', tasks: 43, successRate: 90.7, avgDuration: 36.1, issues: 9 },
    { period: '2024-07-07', tasks: 47, successRate: 95.7, avgDuration: 31.5, issues: 3 }
  ],
  devicePerformance: [
    {
      deviceId: 'device-1',
      deviceName: '巡检无人机-01',
      tasksCompleted: 234,
      successRate: 96.2,
      avgDuration: 28.5,
      uptime: 98.5,
      lastMaintenance: '2024-07-10T10:00:00Z',
      status: 'active'
    },
    {
      deviceId: 'device-2',
      deviceName: '巡检机器人-02',
      tasksCompleted: 189,
      successRate: 91.5,
      avgDuration: 42.3,
      uptime: 94.2,
      lastMaintenance: '2024-07-08T14:30:00Z',
      status: 'active'
    },
    {
      deviceId: 'device-3',
      deviceName: '安防机器人-03',
      tasksCompleted: 156,
      successRate: 88.9,
      avgDuration: 35.7,
      uptime: 89.7,
      lastMaintenance: '2024-07-05T09:15:00Z',
      status: 'maintenance'
    }
  ],
  targetAnalysis: [
    {
      targetId: 'target-1',
      targetName: '主变压器A1',
      inspectionCount: 89,
      issuesFound: 12,
      avgDuration: 32.5,
      lastInspection: '2024-07-17T09:00:00Z',
      riskLevel: 'medium'
    },
    {
      targetId: 'target-2',
      targetName: '冷却塔区域',
      inspectionCount: 67,
      issuesFound: 18,
      avgDuration: 45.2,
      lastInspection: '2024-07-16T15:30:00Z',
      riskLevel: 'high'
    },
    {
      targetId: 'target-3',
      targetName: '巡检路径-东区',
      inspectionCount: 124,
      issuesFound: 5,
      avgDuration: 28.8,
      lastInspection: '2024-07-17T08:00:00Z',
      riskLevel: 'low'
    }
  ],
  issueCategories: [
    { category: '设备异常', count: 45, percentage: 28.8, trend: 'up' },
    { category: '温度异常', count: 38, percentage: 24.4, trend: 'stable' },
    { category: '振动异常', count: 32, percentage: 20.5, trend: 'down' },
    { category: '安全隐患', count: 25, percentage: 16.0, trend: 'up' },
    { category: '环境问题', count: 16, percentage: 10.3, trend: 'stable' }
  ],
  timeDistribution: [
    { hour: 6, taskCount: 15, successRate: 94.2 },
    { hour: 7, taskCount: 28, successRate: 92.8 },
    { hour: 8, taskCount: 45, successRate: 91.5 },
    { hour: 9, taskCount: 52, successRate: 93.7 },
    { hour: 10, taskCount: 48, successRate: 95.1 },
    { hour: 11, taskCount: 42, successRate: 94.8 },
    { hour: 12, taskCount: 35, successRate: 89.2 },
    { hour: 13, taskCount: 38, successRate: 90.5 },
    { hour: 14, taskCount: 44, successRate: 92.3 },
    { hour: 15, taskCount: 41, successRate: 93.9 },
    { hour: 16, taskCount: 39, successRate: 91.7 },
    { hour: 17, taskCount: 32, successRate: 88.9 }
  ],
  operatorPerformance: [
    {
      operatorId: 'op-1',
      operatorName: '张工程师',
      tasksAssigned: 145,
      tasksCompleted: 138,
      successRate: 95.2,
      avgResponseTime: 12.5
    },
    {
      operatorId: 'op-2',
      operatorName: '李技术员',
      tasksAssigned: 132,
      tasksCompleted: 124,
      successRate: 93.9,
      avgResponseTime: 15.2
    },
    {
      operatorId: 'op-3',
      operatorName: '王维护员',
      tasksAssigned: 98,
      tasksCompleted: 89,
      successRate: 90.8,
      avgResponseTime: 18.7
    }
  ]
};

function StatisticsAnalysis() {
  const [statistics] = useState<StatisticsData>(mockStatistics);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState<'overview' | 'devices' | 'targets' | 'issues' | 'operators'>('overview');

  const timeRangeOptions = [
    { value: '1d', label: '今日' },
    { value: '7d', label: '近7天' },
    { value: '30d', label: '近30天' },
    { value: '90d', label: '近90天' },
    { value: '1y', label: '近1年' }
  ];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return TrendingUp;
      case 'down': return TrendingDown;
      default: return Activity;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-red-500';
      case 'down': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">统计分析</h1>
          <p className="text-gray-600 mt-1">巡检数据统计和趋势分析</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select
            value={timeRange}
            onChange={setTimeRange}
            options={timeRangeOptions}
          />
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            导出
          </Button>
        </div>
      </div>

      {/* 概览统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">任务总数</p>
                <p className="text-2xl font-bold">{statistics.overview.totalTasks}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12.5%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">成功率</p>
                <p className="text-2xl font-bold text-green-600">{statistics.overview.successRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +2.3%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均时长</p>
                <p className="text-2xl font-bold">{statistics.overview.avgDuration}分</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -5.2%
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃设备</p>
                <p className="text-2xl font-bold">{statistics.overview.activeDevices}/{statistics.overview.totalDevices}</p>
                <p className="text-xs text-gray-600 flex items-center mt-1">
                  <Activity className="h-3 w-3 mr-1" />
                  稳定
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">关键问题</p>
                <p className="text-2xl font-bold text-red-600">{statistics.overview.criticalIssues}</p>
                <p className="text-xs text-red-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +8.7%
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            趋势分析
          </button>
          <button
            onClick={() => setActiveTab('devices')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'devices'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            设备性能
          </button>
          <button
            onClick={() => setActiveTab('targets')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'targets'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            目标分析
          </button>
          <button
            onClick={() => setActiveTab('issues')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'issues'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            问题分析
          </button>
          <button
            onClick={() => setActiveTab('operators')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'operators'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            操作员绩效
          </button>
        </nav>
      </div>

      {/* 趋势分析标签页 */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>任务执行趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <BarChart3 className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                <p className="text-gray-500">任务执行趋势图表</p>
                <p className="text-sm text-gray-400 mt-2">显示近期任务数量和成功率变化</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>时间分布分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.timeDistribution.slice(0, 6).map((item) => (
                  <div key={item.hour} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 text-sm text-gray-600">
                        {item.hour}:00
                      </div>
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-500 h-2 rounded-full"
                            style={{ width: `${(item.taskCount / 60) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 w-16 text-right">
                      {item.taskCount}个
                    </div>
                    <div className="text-sm text-green-600 w-16 text-right">
                      {item.successRate}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>成功率趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-400" />
                <p className="text-gray-500">成功率趋势图表</p>
                <p className="text-sm text-gray-400 mt-2">显示任务成功率的时间变化</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>问题分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {statistics.issueCategories.map((category) => {
                  const TrendIcon = getTrendIcon(category.trend);
                  return (
                    <div key={category.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-20 text-sm text-gray-600">
                          {category.category}
                        </div>
                        <div className="flex-1">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-red-500 h-2 rounded-full"
                              style={{ width: `${category.percentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 w-12 text-right">
                        {category.count}
                      </div>
                      <TrendIcon className={`h-4 w-4 ${getTrendColor(category.trend)}`} />
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 设备性能标签页 */}
      {activeTab === 'devices' && (
        <Card>
          <CardHeader>
            <CardTitle>设备性能分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">设备名称</th>
                    <th className="text-left py-3 px-4">完成任务</th>
                    <th className="text-left py-3 px-4">成功率</th>
                    <th className="text-left py-3 px-4">平均时长</th>
                    <th className="text-left py-3 px-4">运行时间</th>
                    <th className="text-left py-3 px-4">最后维护</th>
                    <th className="text-left py-3 px-4">状态</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.devicePerformance.map((device) => (
                    <tr key={device.deviceId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{device.deviceName}</div>
                        <div className="text-sm text-gray-500">{device.deviceId}</div>
                      </td>
                      <td className="py-3 px-4">{device.tasksCompleted}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                device.successRate >= 95 ? 'bg-green-500' :
                                device.successRate >= 90 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${device.successRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{device.successRate}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{device.avgDuration}分钟</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                device.uptime >= 95 ? 'bg-green-500' :
                                device.uptime >= 90 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${device.uptime}%` }}
                            />
                          </div>
                          <span className="text-sm">{device.uptime}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{formatRelativeTime(device.lastMaintenance)}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          device.status === 'active' ? 'bg-green-100 text-green-800' :
                          device.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {device.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 目标分析标签页 */}
      {activeTab === 'targets' && (
        <Card>
          <CardHeader>
            <CardTitle>巡检目标分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">目标名称</th>
                    <th className="text-left py-3 px-4">巡检次数</th>
                    <th className="text-left py-3 px-4">发现问题</th>
                    <th className="text-left py-3 px-4">平均时长</th>
                    <th className="text-left py-3 px-4">风险等级</th>
                    <th className="text-left py-3 px-4">最后巡检</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.targetAnalysis.map((target) => (
                    <tr key={target.targetId} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-medium">{target.targetName}</div>
                        <div className="text-sm text-gray-500">{target.targetId}</div>
                      </td>
                      <td className="py-3 px-4">{target.inspectionCount}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-red-600">{target.issuesFound}</span>
                          <span className="text-sm text-gray-500">
                            ({((target.issuesFound / target.inspectionCount) * 100).toFixed(1)}%)
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{target.avgDuration}分钟</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${getRiskLevelColor(target.riskLevel)}`}>
                          {target.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4">{formatRelativeTime(target.lastInspection)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 问题分析标签页 */}
      {activeTab === 'issues' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>问题分类统计</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <PieChart className="h-8 w-8 mx-auto mb-2 text-orange-400" />
                <p className="text-gray-500">问题分类饼图</p>
                <p className="text-sm text-gray-400 mt-2">显示各类问题的分布比例</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>问题趋势分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.issueCategories.map((category) => {
                  const TrendIcon = getTrendIcon(category.trend);
                  return (
                    <div key={category.category} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{category.category}</h4>
                          <p className="text-sm text-gray-500">
                            {category.count}个问题 • {category.percentage}%
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <TrendIcon className={`h-5 w-5 ${getTrendColor(category.trend)}`} />
                          <span className={`text-sm ${getTrendColor(category.trend)}`}>
                            {category.trend === 'up' ? '上升' : category.trend === 'down' ? '下降' : '稳定'}
                          </span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full"
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 操作员绩效标签页 */}
      {activeTab === 'operators' && (
        <Card>
          <CardHeader>
            <CardTitle>操作员绩效分析</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">操作员</th>
                    <th className="text-left py-3 px-4">分配任务</th>
                    <th className="text-left py-3 px-4">完成任务</th>
                    <th className="text-left py-3 px-4">完成率</th>
                    <th className="text-left py-3 px-4">成功率</th>
                    <th className="text-left py-3 px-4">平均响应时间</th>
                    <th className="text-left py-3 px-4">绩效评级</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.operatorPerformance.map((operator) => {
                    const completionRate = (operator.tasksCompleted / operator.tasksAssigned) * 100;
                    const performanceScore = (completionRate + operator.successRate) / 2;
                    return (
                      <tr key={operator.operatorId} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-3">
                            <Users className="h-5 w-5 text-gray-400" />
                            <div>
                              <div className="font-medium">{operator.operatorName}</div>
                              <div className="text-sm text-gray-500">{operator.operatorId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">{operator.tasksAssigned}</td>
                        <td className="py-3 px-4">{operator.tasksCompleted}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  completionRate >= 95 ? 'bg-green-500' :
                                  completionRate >= 90 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${completionRate}%` }}
                              />
                            </div>
                            <span className="text-sm">{completionRate.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">{operator.successRate}%</td>
                        <td className="py-3 px-4">{operator.avgResponseTime}分钟</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            performanceScore >= 95 ? 'bg-green-100 text-green-800' :
                            performanceScore >= 90 ? 'bg-yellow-100 text-yellow-800' :
                            performanceScore >= 80 ? 'bg-orange-100 text-orange-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {performanceScore >= 95 ? '优秀' :
                             performanceScore >= 90 ? '良好' :
                             performanceScore >= 80 ? '一般' : '需改进'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default StatisticsAnalysis;
