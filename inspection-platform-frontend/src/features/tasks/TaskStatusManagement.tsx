import React, { useState } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Play,
  Pause,
  Square,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Edit,
  FileText,
  User,
  Calendar,
  MapPin,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 任务状态类型定义
interface TaskStatus {
  id: string;
  taskId: string;
  taskName: string;
  taskType: 'instant' | 'scheduled' | 'emergency' | 'maintenance';
  deviceId: string;
  deviceName: string;
  targetId: string;
  targetName: string;
  assignedTo: string;
  status: 'pending' | 'approved' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled' | 'review_required';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress: number;
  stage: 'preparation' | 'execution' | 'verification' | 'completion' | 'review';
  startTime?: string;
  endTime?: string;
  estimatedDuration: number;
  actualDuration?: number;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  checkpoints: {
    id: string;
    name: string;
    status: 'pending' | 'completed' | 'failed' | 'skipped';
    completedAt?: string;
    notes?: string;
  }[];
  issues: {
    id: string;
    type: 'warning' | 'error' | 'critical';
    description: string;
    reportedAt: string;
    resolved: boolean;
  }[];
  approvals: {
    level: number;
    approver: string;
    status: 'pending' | 'approved' | 'rejected';
    timestamp?: string;
    comments?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  notes: string;
}

// Mock数据
const mockTaskStatuses: TaskStatus[] = [
  {
    id: 'status-1',
    taskId: 'task-001',
    taskName: '主变压器A1日常巡检',
    taskType: 'scheduled',
    deviceId: 'device-1',
    deviceName: '巡检无人机-01',
    targetId: 'target-1',
    targetName: '主变压器A1',
    assignedTo: '张工程师',
    status: 'running',
    priority: 'high',
    progress: 65,
    stage: 'execution',
    startTime: '2024-07-17T09:00:00Z',
    estimatedDuration: 30,
    actualDuration: 20,
    location: {
      lat: 39.9042,
      lng: 116.4074,
      address: '北京市朝阳区电力大厦A区'
    },
    checkpoints: [
      {
        id: 'cp-1',
        name: '外观检查',
        status: 'completed',
        completedAt: '2024-07-17T09:05:00Z',
        notes: '外观正常，无异常'
      },
      {
        id: 'cp-2',
        name: '温度检测',
        status: 'completed',
        completedAt: '2024-07-17T09:15:00Z',
        notes: '温度正常，68°C'
      },
      {
        id: 'cp-3',
        name: '声音检测',
        status: 'pending'
      }
    ],
    issues: [
      {
        id: 'issue-1',
        type: 'warning',
        description: '发现轻微油渍，需要关注',
        reportedAt: '2024-07-17T09:10:00Z',
        resolved: false
      }
    ],
    approvals: [
      {
        level: 1,
        approver: '李主管',
        status: 'approved',
        timestamp: '2024-07-17T08:55:00Z',
        comments: '批准执行'
      }
    ],
    createdAt: '2024-07-17T08:30:00Z',
    updatedAt: '2024-07-17T09:20:00Z',
    notes: '按计划执行中'
  },
  {
    id: 'status-2',
    taskId: 'task-002',
    taskName: '冷却塔紧急检查',
    taskType: 'emergency',
    deviceId: 'device-2',
    deviceName: '巡检机器人-02',
    targetId: 'target-2',
    targetName: '冷却塔区域',
    assignedTo: '王技术员',
    status: 'review_required',
    priority: 'critical',
    progress: 100,
    stage: 'review',
    startTime: '2024-07-17T07:00:00Z',
    endTime: '2024-07-17T08:30:00Z',
    estimatedDuration: 60,
    actualDuration: 90,
    location: {
      lat: 39.9052,
      lng: 116.4084,
      address: '北京市朝阳区电力大厦B区'
    },
    checkpoints: [
      {
        id: 'cp-4',
        name: '振动检测',
        status: 'completed',
        completedAt: '2024-07-17T07:30:00Z',
        notes: '振动异常，超出正常范围'
      },
      {
        id: 'cp-5',
        name: '温度检测',
        status: 'completed',
        completedAt: '2024-07-17T08:00:00Z',
        notes: '温度偏高，需要处理'
      },
      {
        id: 'cp-6',
        name: '水质检测',
        status: 'completed',
        completedAt: '2024-07-17T08:20:00Z',
        notes: '水质正常'
      }
    ],
    issues: [
      {
        id: 'issue-2',
        type: 'critical',
        description: '冷却塔振动异常，可能存在机械故障',
        reportedAt: '2024-07-17T07:35:00Z',
        resolved: false
      },
      {
        id: 'issue-3',
        type: 'error',
        description: '冷却水温度过高，超出安全范围',
        reportedAt: '2024-07-17T08:05:00Z',
        resolved: false
      }
    ],
    approvals: [
      {
        level: 1,
        approver: '李主管',
        status: 'approved',
        timestamp: '2024-07-17T06:55:00Z'
      },
      {
        level: 2,
        approver: '陈总工',
        status: 'pending',
        comments: '需要详细分析报告'
      }
    ],
    createdAt: '2024-07-17T06:30:00Z',
    updatedAt: '2024-07-17T08:35:00Z',
    notes: '发现严重问题，需要立即处理'
  },
  {
    id: 'status-3',
    taskId: 'task-003',
    taskName: '东区巡检路径检查',
    taskType: 'scheduled',
    deviceId: 'device-3',
    deviceName: '安防机器人-03',
    targetId: 'target-3',
    targetName: '巡检路径-东区',
    assignedTo: '刘维护员',
    status: 'completed',
    priority: 'medium',
    progress: 100,
    stage: 'completion',
    startTime: '2024-07-17T06:00:00Z',
    endTime: '2024-07-17T07:00:00Z',
    estimatedDuration: 60,
    actualDuration: 60,
    location: {
      lat: 39.9062,
      lng: 116.4094,
      address: '北京市朝阳区电力大厦东区'
    },
    checkpoints: [
      {
        id: 'cp-7',
        name: '路径畅通检查',
        status: 'completed',
        completedAt: '2024-07-17T06:20:00Z',
        notes: '路径畅通'
      },
      {
        id: 'cp-8',
        name: '安全标识检查',
        status: 'completed',
        completedAt: '2024-07-17T06:40:00Z',
        notes: '标识完整'
      },
      {
        id: 'cp-9',
        name: '照明检查',
        status: 'completed',
        completedAt: '2024-07-17T06:55:00Z',
        notes: '照明正常'
      }
    ],
    issues: [],
    approvals: [
      {
        level: 1,
        approver: '李主管',
        status: 'approved',
        timestamp: '2024-07-17T07:05:00Z',
        comments: '检查完成，无异常'
      }
    ],
    createdAt: '2024-07-17T05:30:00Z',
    updatedAt: '2024-07-17T07:10:00Z',
    notes: '巡检完成，一切正常'
  }
];

// 任务详情模态框组件
interface TaskDetailModalProps {
  task: TaskStatus | null;
  isOpen: boolean;
  onClose: () => void;
}

function TaskDetailModal({ task, isOpen, onClose }: TaskDetailModalProps) {
  if (!task) return null;

  const getIssueIcon = (type: string) => {
    switch (type) {
      case 'critical': return XCircle;
      case 'error': return AlertTriangle;
      case 'warning': return Clock;
      default: return AlertTriangle;
    }
  };

  const getIssueColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600';
      case 'error': return 'text-orange-600';
      case 'warning': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="任务详情" size="xl">
      <div className="space-y-6">
        {/* 基本信息 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">任务名称:</span> {task.taskName}</div>
              <div><span className="text-gray-500">任务类型:</span> {task.taskType}</div>
              <div><span className="text-gray-500">执行设备:</span> {task.deviceName}</div>
              <div><span className="text-gray-500">巡检目标:</span> {task.targetName}</div>
              <div><span className="text-gray-500">负责人:</span> {task.assignedTo}</div>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">执行状态</h4>
            <div className="space-y-2 text-sm">
              <div><span className="text-gray-500">当前状态:</span> <StatusBadge status={task.status} /></div>
              <div><span className="text-gray-500">执行阶段:</span> {task.stage}</div>
              <div><span className="text-gray-500">完成进度:</span> {task.progress}%</div>
              <div><span className="text-gray-500">开始时间:</span> {task.startTime ? formatRelativeTime(task.startTime) : '未开始'}</div>
              <div><span className="text-gray-500">预计时长:</span> {task.estimatedDuration}分钟</div>
            </div>
          </div>
        </div>

        {/* 检查点 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">检查点进度</h4>
          <div className="space-y-2">
            {task.checkpoints.map((checkpoint) => (
              <div key={checkpoint.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    checkpoint.status === 'completed' ? 'bg-green-500' :
                    checkpoint.status === 'failed' ? 'bg-red-500' :
                    checkpoint.status === 'skipped' ? 'bg-gray-400' :
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="font-medium">{checkpoint.name}</div>
                    {checkpoint.notes && (
                      <div className="text-sm text-gray-500">{checkpoint.notes}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {checkpoint.completedAt ? formatRelativeTime(checkpoint.completedAt) : '待完成'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 问题列表 */}
        {task.issues.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">发现问题</h4>
            <div className="space-y-2">
              {task.issues.map((issue) => {
                const IssueIcon = getIssueIcon(issue.type);
                return (
                  <div key={issue.id} className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg">
                    <IssueIcon className={`h-5 w-5 mt-0.5 ${getIssueColor(issue.type)}`} />
                    <div className="flex-1">
                      <div className="font-medium">{issue.description}</div>
                      <div className="text-sm text-gray-500">
                        {formatRelativeTime(issue.reportedAt)} • 
                        {issue.resolved ? ' 已解决' : ' 待解决'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 审批流程 */}
        <div>
          <h4 className="font-medium text-gray-900 mb-2">审批流程</h4>
          <div className="space-y-2">
            {task.approvals.map((approval, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    approval.status === 'approved' ? 'bg-green-500' :
                    approval.status === 'rejected' ? 'bg-red-500' :
                    'bg-yellow-500'
                  }`} />
                  <div>
                    <div className="font-medium">级别 {approval.level} - {approval.approver}</div>
                    {approval.comments && (
                      <div className="text-sm text-gray-500">{approval.comments}</div>
                    )}
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  {approval.timestamp ? formatRelativeTime(approval.timestamp) : '待审批'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 备注 */}
        {task.notes && (
          <div>
            <h4 className="font-medium text-gray-900 mb-2">备注</h4>
            <div className="p-3 bg-gray-50 rounded-lg text-sm">
              {task.notes}
            </div>
          </div>
        )}
      </div>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          关闭
        </Button>
      </ModalFooter>
    </Modal>
  );
}

function TaskStatusManagement() {
  const [taskStatuses, setTaskStatuses] = useState<TaskStatus[]>(mockTaskStatuses);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedTask, setSelectedTask] = useState<TaskStatus | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 筛选任务
  const filteredTasks = taskStatuses.filter(task => {
    const matchesSearch = task.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignedTo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.targetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || task.taskType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  // 事件处理函数
  const handleTaskAction = (taskId: string, action: 'start' | 'pause' | 'resume' | 'stop' | 'approve' | 'reject') => {
    setTaskStatuses(taskStatuses.map(task => {
      if (task.id === taskId) {
        switch (action) {
          case 'start':
            return { ...task, status: 'running', startTime: new Date().toISOString() };
          case 'pause':
            return { ...task, status: 'paused' };
          case 'resume':
            return { ...task, status: 'running' };
          case 'stop':
            return { ...task, status: 'cancelled', endTime: new Date().toISOString() };
          case 'approve':
            return { ...task, status: 'approved' };
          case 'reject':
            return { ...task, status: 'cancelled' };
          default:
            return task;
        }
      }
      return task;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return Play;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'paused': return Pause;
      case 'cancelled': return Square;
      case 'review_required': return FileText;
      default: return Clock;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      instant: '即时任务',
      scheduled: '计划任务',
      emergency: '紧急任务',
      maintenance: '维护任务'
    };
    return typeMap[type] || type;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">任务状态管理</h1>
        <p className="text-gray-600 mt-1">实时监控和管理任务执行状态</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">任务总数</p>
                <p className="text-2xl font-bold">{taskStatuses.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">执行中</p>
                <p className="text-2xl font-bold text-green-600">
                  {taskStatuses.filter(t => t.status === 'running').length}
                </p>
              </div>
              <Play className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待审核</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {taskStatuses.filter(t => t.status === 'review_required').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-purple-600">
                  {taskStatuses.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>任务状态列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm">
                <BarChart3 className="h-4 w-4 mr-2" />
                统计报告
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索任务名称、负责人或目标..."
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
                { value: 'pending', label: '待执行' },
                { value: 'approved', label: '已批准' },
                { value: 'running', label: '执行中' },
                { value: 'paused', label: '已暂停' },
                { value: 'completed', label: '已完成' },
                { value: 'failed', label: '失败' },
                { value: 'cancelled', label: '已取消' },
                { value: 'review_required', label: '待审核' }
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'all', label: '全部优先级' },
                { value: 'critical', label: '关键' },
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' }
              ]}
            />
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'instant', label: '即时任务' },
                { value: 'scheduled', label: '计划任务' },
                { value: 'emergency', label: '紧急任务' },
                { value: 'maintenance', label: '维护任务' }
              ]}
            />
          </div>

          {/* 任务表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>执行设备</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>问题</TableHead>
                <TableHead>开始时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => {
                const StatusIcon = getStatusIcon(task.status);
                return (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{task.taskName}</div>
                        <div className="text-sm text-gray-500 flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {task.targetName}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getTypeLabel(task.taskType)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{task.deviceName}</div>
                        <div className="text-gray-500">{task.deviceId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1 text-gray-400" />
                        {task.assignedTo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <StatusIcon className={`h-4 w-4 ${
                          task.status === 'completed' ? 'text-green-500' :
                          task.status === 'failed' ? 'text-red-500' :
                          task.status === 'running' ? 'text-blue-500' :
                          task.status === 'review_required' ? 'text-yellow-500' :
                          'text-gray-400'
                        }`} />
                        <StatusBadge status={task.status} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              task.progress === 100 ? 'bg-green-500' :
                              task.progress >= 50 ? 'bg-blue-500' :
                              'bg-yellow-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">{task.progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {task.issues.length > 0 ? (
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="text-sm text-red-600">{task.issues.length}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">无</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {task.startTime ? (
                          <>
                            <div>{formatRelativeTime(task.startTime)}</div>
                            <div className="text-gray-500 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {task.estimatedDuration}分钟
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400">未开始</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTask(task);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {task.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTaskAction(task.id, 'start')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}

                        {task.status === 'running' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTaskAction(task.id, 'pause')}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}

                        {task.status === 'paused' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTaskAction(task.id, 'resume')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}

                        {(task.status === 'running' || task.status === 'paused') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTaskAction(task.id, 'stop')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}

                        {task.status === 'review_required' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTaskAction(task.id, 'approve')}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleTaskAction(task.id, 'reject')}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 任务详情模态框 */}
      <TaskDetailModal
        task={selectedTask}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedTask(null);
        }}
      />
    </div>
  );
}

export default TaskStatusManagement;
