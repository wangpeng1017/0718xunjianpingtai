import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Clock,
  Repeat,
  Play,
  Pause,
  User,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 计划任务类型定义
interface ScheduledTask {
  id: string;
  name: string;
  description: string;
  deviceId: string;
  deviceName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'inactive' | 'paused' | 'expired';
  assignedTo: string;
  schedule: {
    type: 'once' | 'daily' | 'weekly' | 'monthly';
    startDate: string;
    endDate?: string;
    time: string; // HH:mm格式
    daysOfWeek?: number[]; // 0-6, 0为周日
    dayOfMonth?: number; // 1-31
  };
  estimatedDuration: number; // 分钟
  targets: {
    id: string;
    name: string;
    location: { lat: number; lng: number };
  }[];
  lastExecution?: string;
  nextExecution: string;
  executionCount: number;
  successRate: number; // 百分比
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// Mock数据
const mockScheduledTasks: ScheduledTask[] = [
  {
    id: 'task-1',
    name: '东区日常巡检',
    description: '每日上午9点执行东区设备巡检',
    deviceId: 'device-1',
    deviceName: '巡检无人机-01',
    status: 'active',
    priority: 'medium',
    schedule: {
      type: 'daily',
      time: '09:00',
      interval: 1
    },
    estimatedDuration: 45,
    targets: [
      { id: 'target-1', name: '变压器A1', location: { lat: 39.9042, lng: 116.4074 } },
      { id: 'target-2', name: '配电柜B2', location: { lat: 39.9052, lng: 116.4084 } }
    ],
    lastExecution: '2024-07-17T09:00:00Z',
    nextExecution: '2024-07-18T09:00:00Z',
    executionCount: 15,
    successRate: 93.3,
    createdAt: '2024-07-01T10:00:00Z',
    updatedAt: '2024-07-17T09:30:00Z',
    notes: '正常执行中'
  },
  {
    id: 'task-2',
    name: '西区周检任务',
    description: '每周一上午10点执行西区全面检查',
    deviceId: 'device-2',
    deviceName: '巡检机器人-02',
    status: 'scheduled',
    priority: 'high',
    schedule: {
      type: 'weekly',
      time: '10:00',
      interval: 1,
      dayOfWeek: 1
    },
    estimatedDuration: 90,
    targets: [
      { id: 'target-3', name: '冷却塔C1', location: { lat: 39.9062, lng: 116.4094 } }
    ],
    nextExecution: '2024-07-22T10:00:00Z',
    executionCount: 3,
    successRate: 100.0,
    createdAt: '2024-06-15T14:00:00Z',
    updatedAt: '2024-07-15T10:30:00Z',
    notes: '设备状态良好'
  }
];

function ScheduledTasks() {
  const [tasks, setTasks] = useState<ScheduledTask[]>(mockScheduledTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 筛选任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'scheduled': return 'text-blue-600';
      case 'paused': return 'text-yellow-600';
      case 'completed': return 'text-gray-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">计划任务</h1>
          <p className="text-gray-600 mt-1">管理定时和周期性巡检任务</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建任务
        </Button>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <CardTitle>计划任务列表</CardTitle>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索任务名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: '活跃' },
                { value: 'scheduled', label: '已调度' },
                { value: 'paused', label: '暂停' },
                { value: 'completed', label: '已完成' },
                { value: 'failed', label: '失败' }
              ]}
            />
          </div>

          {/* 任务表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务信息</TableHead>
                <TableHead>设备</TableHead>
                <TableHead>调度</TableHead>
                <TableHead>执行统计</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>下次执行</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{task.name}</div>
                      <div className="text-sm text-gray-500">{task.description}</div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                        <span className="text-xs text-gray-500">
                          {task.targets.length} 个目标
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{task.deviceName}</div>
                      <div className="text-gray-500">{task.deviceId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="flex items-center space-x-1">
                        <Repeat className="h-3 w-3" />
                        <span>{task.schedule.type}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-500">
                        <Clock className="h-3 w-3" />
                        <span>{task.schedule.time}</span>
                      </div>
                      <div className="text-gray-500">
                        预计 {task.estimatedDuration} 分钟
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>执行 {task.executionCount} 次</div>
                      <div className="text-green-600">
                        成功率 {task.successRate.toFixed(1)}%
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{formatRelativeTime(task.nextExecution)}</div>
                      <div className="text-gray-500">
                        {new Date(task.nextExecution).toLocaleString('zh-CN')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Play className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default ScheduledTasks;
