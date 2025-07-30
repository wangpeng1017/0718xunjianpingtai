import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  Play,
  Pause,
  Square,
  RotateCcw,
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Users,
  Target,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 任务调度类型定义
interface TaskSchedule {
  id: string;
  name: string;
  description: string;
  type: 'one_time' | 'recurring' | 'conditional' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'failed' | 'cancelled';
  schedule: {
    startTime: string;
    endTime?: string;
    timezone: string;
    recurrence?: {
      pattern: 'daily' | 'weekly' | 'monthly' | 'custom';
      interval: number;
      daysOfWeek?: number[];
      daysOfMonth?: number[];
      endDate?: string;
    };
    conditions?: {
      weather: string[];
      temperature: { min: number; max: number };
      deviceAvailability: string[];
      customRules: string[];
    };
  };
  tasks: {
    id: string;
    name: string;
    deviceId: string;
    deviceName: string;
    targetIds: string[];
    estimatedDuration: number;
    dependencies: string[];
    requirements: string[];
  }[];
  resources: {
    devices: string[];
    operators: string[];
    estimatedCost: number;
    energyConsumption: number;
  };
  execution: {
    currentTask?: string;
    progress: number;
    startedAt?: string;
    completedAt?: string;
    nextRun?: string;
    lastRun?: string;
    runCount: number;
    successCount: number;
    failureCount: number;
  };
  notifications: {
    beforeStart: number; // minutes
    onCompletion: boolean;
    onFailure: boolean;
    recipients: string[];
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Mock数据
const mockSchedules: TaskSchedule[] = [
  {
    id: 'schedule-1',
    name: '东区日常巡检调度',
    description: '每日上午9点执行东区变电站巡检任务',
    type: 'recurring',
    priority: 'high',
    status: 'scheduled',
    schedule: {
      startTime: '09:00:00',
      timezone: 'Asia/Shanghai',
      recurrence: {
        pattern: 'daily',
        interval: 1,
        endDate: '2024-12-31T23:59:59Z'
      }
    },
    tasks: [
      {
        id: 'task-1',
        name: '主变压器A1检查',
        deviceId: 'device-1',
        deviceName: '巡检无人机-01',
        targetIds: ['target-1'],
        estimatedDuration: 15,
        dependencies: [],
        requirements: ['温度检测', '外观检查']
      },
      {
        id: 'task-2',
        name: '配电柜B2检查',
        deviceId: 'device-1',
        deviceName: '巡检无人机-01',
        targetIds: ['target-2'],
        estimatedDuration: 10,
        dependencies: ['task-1'],
        requirements: ['电压检测', '开关状态检查']
      }
    ],
    resources: {
      devices: ['device-1'],
      operators: ['张工程师'],
      estimatedCost: 150.0,
      energyConsumption: 12.5
    },
    execution: {
      progress: 0,
      nextRun: '2024-07-18T09:00:00Z',
      lastRun: '2024-07-17T09:00:00Z',
      runCount: 15,
      successCount: 14,
      failureCount: 1
    },
    notifications: {
      beforeStart: 30,
      onCompletion: true,
      onFailure: true,
      recipients: ['张工程师', '李主管']
    },
    createdAt: '2024-07-01T08:00:00Z',
    updatedAt: '2024-07-17T08:30:00Z',
    createdBy: '张工程师'
  },
  {
    id: 'schedule-2',
    name: '西区周检调度',
    description: '每周一上午10点执行西区设备全面检查',
    type: 'recurring',
    priority: 'medium',
    status: 'scheduled',
    schedule: {
      startTime: '10:00:00',
      timezone: 'Asia/Shanghai',
      recurrence: {
        pattern: 'weekly',
        interval: 1,
        daysOfWeek: [1], // Monday
        endDate: '2024-12-31T23:59:59Z'
      }
    },
    tasks: [
      {
        id: 'task-3',
        name: '高压开关柜检查',
        deviceId: 'device-2',
        deviceName: '巡检机器人-02',
        targetIds: ['target-3', 'target-4'],
        estimatedDuration: 45,
        dependencies: [],
        requirements: ['绝缘检测', '机械检查']
      }
    ],
    resources: {
      devices: ['device-2'],
      operators: ['李技术员'],
      estimatedCost: 300.0,
      energyConsumption: 25.0
    },
    execution: {
      progress: 0,
      nextRun: '2024-07-22T10:00:00Z',
      lastRun: '2024-07-15T10:00:00Z',
      runCount: 3,
      successCount: 3,
      failureCount: 0
    },
    notifications: {
      beforeStart: 60,
      onCompletion: true,
      onFailure: true,
      recipients: ['李技术员', '王主管']
    },
    createdAt: '2024-07-01T09:00:00Z',
    updatedAt: '2024-07-15T10:45:00Z',
    createdBy: '李技术员'
  },
  {
    id: 'schedule-3',
    name: '紧急响应调度',
    description: '设备异常时的紧急巡检调度',
    type: 'conditional',
    priority: 'critical',
    status: 'running',
    schedule: {
      startTime: '2024-07-17T10:30:00Z',
      timezone: 'Asia/Shanghai',
      conditions: {
        weather: ['任何天气'],
        temperature: { min: -10, max: 50 },
        deviceAvailability: ['device-1', 'device-2'],
        customRules: ['温度异常', '振动异常']
      }
    },
    tasks: [
      {
        id: 'task-4',
        name: '异常设备紧急检查',
        deviceId: 'device-1',
        deviceName: '巡检无人机-01',
        targetIds: ['target-1'],
        estimatedDuration: 30,
        dependencies: [],
        requirements: ['故障诊断', '安全评估']
      }
    ],
    resources: {
      devices: ['device-1'],
      operators: ['张工程师', '李主管'],
      estimatedCost: 500.0,
      energyConsumption: 20.0
    },
    execution: {
      currentTask: 'task-4',
      progress: 65,
      startedAt: '2024-07-17T10:30:00Z',
      runCount: 1,
      successCount: 0,
      failureCount: 0
    },
    notifications: {
      beforeStart: 5,
      onCompletion: true,
      onFailure: true,
      recipients: ['张工程师', '李主管', '王总工']
    },
    createdAt: '2024-07-17T10:25:00Z',
    updatedAt: '2024-07-17T10:30:00Z',
    createdBy: '系统自动'
  }
];

// 调度表单组件
interface ScheduleFormProps {
  schedule?: TaskSchedule;
  onSubmit: (schedule: Partial<TaskSchedule>) => void;
  onCancel: () => void;
}

function ScheduleForm({ schedule, onSubmit, onCancel }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    name: schedule?.name || '',
    description: schedule?.description || '',
    type: schedule?.type || 'one_time',
    priority: schedule?.priority || 'medium',
    startTime: schedule?.schedule?.startTime || '09:00:00',
    recurrencePattern: schedule?.schedule?.recurrence?.pattern || 'daily',
    recurrenceInterval: schedule?.schedule?.recurrence?.interval || 1,
    beforeStartNotification: schedule?.notifications?.beforeStart || 30,
    recipients: schedule?.notifications?.recipients?.join(', ') || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const typeOptions = [
    { value: 'one_time', label: '一次性任务' },
    { value: 'recurring', label: '循环任务' },
    { value: 'conditional', label: '条件触发' },
    { value: 'emergency', label: '紧急任务' }
  ];

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '关键' }
  ];

  const recurrenceOptions = [
    { value: 'daily', label: '每日' },
    { value: 'weekly', label: '每周' },
    { value: 'monthly', label: '每月' },
    { value: 'custom', label: '自定义' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '调度名称不能为空';
    }
    if (!formData.description.trim()) {
      newErrors.description = '调度描述不能为空';
    }
    if (!formData.startTime) {
      newErrors.startTime = '开始时间不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const scheduleData: Partial<TaskSchedule> = {
      ...formData,
      schedule: {
        startTime: formData.startTime,
        timezone: 'Asia/Shanghai',
        recurrence: formData.type === 'recurring' ? {
          pattern: formData.recurrencePattern as any,
          interval: formData.recurrenceInterval
        } : undefined
      },
      tasks: schedule?.tasks || [],
      resources: schedule?.resources || {
        devices: [],
        operators: [],
        estimatedCost: 0,
        energyConsumption: 0
      },
      execution: schedule?.execution || {
        progress: 0,
        runCount: 0,
        successCount: 0,
        failureCount: 0
      },
      notifications: {
        beforeStart: formData.beforeStartNotification,
        onCompletion: true,
        onFailure: true,
        recipients: formData.recipients.split(',').map(r => r.trim()).filter(Boolean)
      },
      status: 'draft',
      createdBy: schedule?.createdBy || '当前用户',
      createdAt: schedule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (schedule) {
      scheduleData.id = schedule.id;
    } else {
      scheduleData.id = `schedule-${Date.now()}`;
    }

    onSubmit(scheduleData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="调度名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入调度名称"
          />
        </FormField>

        <FormField label="任务类型">
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as TaskSchedule['type'] })}
            options={typeOptions}
          />
        </FormField>

        <FormField label="优先级">
          <Select
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as TaskSchedule['priority'] })}
            options={priorityOptions}
          />
        </FormField>

        <FormField label="开始时间" required error={errors.startTime}>
          <Input
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
          />
        </FormField>

        {formData.type === 'recurring' && (
          <>
            <FormField label="重复模式">
              <Select
                value={formData.recurrencePattern}
                onChange={(value) => setFormData({ ...formData, recurrencePattern: value })}
                options={recurrenceOptions}
              />
            </FormField>

            <FormField label="重复间隔">
              <Input
                type="number"
                min="1"
                value={formData.recurrenceInterval}
                onChange={(e) => setFormData({ ...formData, recurrenceInterval: parseInt(e.target.value) || 1 })}
                placeholder="1"
              />
            </FormField>
          </>
        )}

        <FormField label="提前通知(分钟)">
          <Input
            type="number"
            min="0"
            value={formData.beforeStartNotification}
            onChange={(e) => setFormData({ ...formData, beforeStartNotification: parseInt(e.target.value) || 0 })}
            placeholder="30"
          />
        </FormField>
      </div>

      <FormField label="调度描述" required error={errors.description}>
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请描述调度的目标和要求"
          rows={3}
        />
      </FormField>

      <FormField label="通知接收人">
        <Input
          value={formData.recipients}
          onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
          placeholder="请输入接收人，用逗号分隔"
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {schedule ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function TaskScheduling() {
  const [schedules, setSchedules] = useState<TaskSchedule[]>(mockSchedules);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSchedule, setSelectedSchedule] = useState<TaskSchedule | null>(null);
  
  // 模态框状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 自动更新执行状态
  useEffect(() => {
    const interval = setInterval(() => {
      setSchedules(prev => prev.map(schedule => {
        if (schedule.status === 'running' && schedule.execution.currentTask) {
          return {
            ...schedule,
            execution: {
              ...schedule.execution,
              progress: Math.min(schedule.execution.progress + Math.random() * 5, 100)
            }
          };
        }
        return schedule;
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // 筛选调度
  const filteredSchedules = schedules.filter(schedule => {
    const matchesSearch = schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         schedule.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || schedule.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || schedule.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // 事件处理函数
  const handleCreateSchedule = (scheduleData: Partial<TaskSchedule>) => {
    setSchedules([scheduleData as TaskSchedule, ...schedules]);
    setShowCreateModal(false);
  };

  const handleUpdateSchedule = (scheduleData: Partial<TaskSchedule>) => {
    if (selectedSchedule?.id) {
      setSchedules(schedules.map(s => 
        s.id === selectedSchedule.id ? { ...s, ...scheduleData } : s
      ));
      setShowEditModal(false);
      setSelectedSchedule(null);
    }
  };

  const handleScheduleAction = (scheduleId: string, action: 'start' | 'pause' | 'stop' | 'resume') => {
    setSchedules(schedules.map(s => {
      if (s.id === scheduleId) {
        switch (action) {
          case 'start':
            return {
              ...s,
              status: 'running',
              execution: {
                ...s.execution,
                startedAt: new Date().toISOString(),
                progress: 0,
                currentTask: s.tasks[0]?.id
              }
            };
          case 'pause':
            return { ...s, status: 'paused' };
          case 'resume':
            return { ...s, status: 'running' };
          case 'stop':
            return {
              ...s,
              status: 'scheduled',
              execution: {
                ...s.execution,
                progress: 0,
                currentTask: undefined
              }
            };
          default:
            return s;
        }
      }
      return s;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return Play;
      case 'paused': return Pause;
      case 'completed': return CheckCircle;
      case 'failed': return AlertTriangle;
      case 'scheduled': return Calendar;
      default: return Clock;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      one_time: '一次性',
      recurring: '循环',
      conditional: '条件触发',
      emergency: '紧急'
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
        <h1 className="text-3xl font-bold text-gray-900">任务调度</h1>
        <p className="text-gray-600 mt-1">智能调度和管理巡检任务</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">调度总数</p>
                <p className="text-2xl font-bold">{schedules.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">运行中</p>
                <p className="text-2xl font-bold text-green-600">
                  {schedules.filter(s => s.status === 'running').length}
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
                <p className="text-sm text-gray-600">已调度</p>
                <p className="text-2xl font-bold text-blue-600">
                  {schedules.filter(s => s.status === 'scheduled').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">成功率</p>
                <p className="text-2xl font-bold text-purple-600">
                  {schedules.reduce((sum, s) => sum + s.execution.successCount, 0) /
                   Math.max(schedules.reduce((sum, s) => sum + s.execution.runCount, 0), 1) * 100
                  }%
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>任务调度列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                调度设置
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建调度
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
                  placeholder="搜索调度名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'one_time', label: '一次性' },
                { value: 'recurring', label: '循环' },
                { value: 'conditional', label: '条件触发' },
                { value: 'emergency', label: '紧急' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'draft', label: '草稿' },
                { value: 'scheduled', label: '已调度' },
                { value: 'running', label: '运行中' },
                { value: 'paused', label: '已暂停' },
                { value: 'completed', label: '已完成' },
                { value: 'failed', label: '失败' }
              ]}
            />
          </div>

          {/* 调度表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>调度信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>执行进度</TableHead>
                <TableHead>下次运行</TableHead>
                <TableHead>成功率</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSchedules.map((schedule) => {
                const StatusIcon = getStatusIcon(schedule.status);
                const successRate = schedule.execution.runCount > 0
                  ? (schedule.execution.successCount / schedule.execution.runCount) * 100
                  : 0;

                return (
                  <TableRow key={schedule.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${
                          schedule.status === 'running' ? 'text-green-500' :
                          schedule.status === 'scheduled' ? 'text-blue-500' :
                          schedule.status === 'paused' ? 'text-yellow-500' :
                          schedule.status === 'failed' ? 'text-red-500' :
                          'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">{schedule.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {schedule.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getTypeLabel(schedule.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(schedule.priority)}`}>
                        {schedule.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={schedule.status} />
                    </TableCell>
                    <TableCell>
                      {schedule.status === 'running' ? (
                        <div className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span>进度</span>
                            <span>{schedule.execution.progress.toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${schedule.execution.progress}%` }}
                            />
                          </div>
                          {schedule.execution.currentTask && (
                            <div className="text-xs text-gray-500">
                              当前: {schedule.tasks.find(t => t.id === schedule.execution.currentTask)?.name}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {schedule.execution.nextRun ? (
                        <div className="text-sm">
                          <div>{formatRelativeTime(schedule.execution.nextRun)}</div>
                          <div className="text-gray-500">
                            {new Date(schedule.execution.nextRun).toLocaleTimeString('zh-CN', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {schedule.execution.runCount > 0 ? (
                        <div className="text-sm">
                          <div className={`font-medium ${
                            successRate >= 90 ? 'text-green-600' :
                            successRate >= 70 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {successRate.toFixed(1)}%
                          </div>
                          <div className="text-gray-500">
                            {schedule.execution.successCount}/{schedule.execution.runCount}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatRelativeTime(schedule.createdAt)}</div>
                        <div className="text-gray-500">by {schedule.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {schedule.status === 'draft' || schedule.status === 'scheduled' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleScheduleAction(schedule.id, 'start')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : schedule.status === 'running' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleScheduleAction(schedule.id, 'pause')}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : schedule.status === 'paused' ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleScheduleAction(schedule.id, 'resume')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : null}

                        {(schedule.status === 'running' || schedule.status === 'paused') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleScheduleAction(schedule.id, 'stop')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* 创建调度模态框 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建任务调度"
        size="lg"
      >
        <ScheduleForm
          onSubmit={handleCreateSchedule}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* 编辑调度模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedSchedule(null);
        }}
        title="编辑任务调度"
        size="lg"
      >
        <ScheduleForm
          schedule={selectedSchedule || undefined}
          onSubmit={handleUpdateSchedule}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedSchedule(null);
          }}
        />
      </Modal>

      {/* 调度详情模态框 */}
      {selectedSchedule && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedSchedule(null);
          }}
          title="调度详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">调度名称:</span> {selectedSchedule.name}</div>
                  <div><span className="text-gray-500">任务类型:</span> {getTypeLabel(selectedSchedule.type)}</div>
                  <div><span className="text-gray-500">优先级:</span> {selectedSchedule.priority}</div>
                  <div><span className="text-gray-500">创建者:</span> {selectedSchedule.createdBy}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">调度设置</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">开始时间:</span> {selectedSchedule.schedule.startTime}</div>
                  <div><span className="text-gray-500">时区:</span> {selectedSchedule.schedule.timezone}</div>
                  {selectedSchedule.schedule.recurrence && (
                    <>
                      <div><span className="text-gray-500">重复模式:</span> {selectedSchedule.schedule.recurrence.pattern}</div>
                      <div><span className="text-gray-500">重复间隔:</span> {selectedSchedule.schedule.recurrence.interval}</div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* 执行统计 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">执行统计</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-medium">总运行次数</div>
                  <div className="text-2xl font-bold text-blue-800">{selectedSchedule.execution.runCount}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-medium">成功次数</div>
                  <div className="text-2xl font-bold text-green-800">{selectedSchedule.execution.successCount}</div>
                </div>
                <div className="p-3 bg-red-50 rounded-lg">
                  <div className="text-red-600 font-medium">失败次数</div>
                  <div className="text-2xl font-bold text-red-800">{selectedSchedule.execution.failureCount}</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 font-medium">成功率</div>
                  <div className="text-2xl font-bold text-purple-800">
                    {selectedSchedule.execution.runCount > 0
                      ? ((selectedSchedule.execution.successCount / selectedSchedule.execution.runCount) * 100).toFixed(1)
                      : 0}%
                  </div>
                </div>
              </div>
            </div>

            {/* 任务列表 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">包含任务</h4>
              <div className="space-y-2">
                {selectedSchedule.tasks.map((task, index) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{task.name}</div>
                        <div className="text-sm text-gray-500">
                          设备: {task.deviceName} • 预计时长: {task.estimatedDuration}分钟
                        </div>
                        {task.dependencies.length > 0 && (
                          <div className="text-xs text-gray-400">
                            依赖: {task.dependencies.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {task.targetIds.length} 个目标
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 资源配置 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">资源配置</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">设备数量:</span>
                  <div className="font-medium">{selectedSchedule.resources.devices.length}</div>
                </div>
                <div>
                  <span className="text-gray-500">操作员:</span>
                  <div className="font-medium">{selectedSchedule.resources.operators.length}</div>
                </div>
                <div>
                  <span className="text-gray-500">预计成本:</span>
                  <div className="font-medium">¥{selectedSchedule.resources.estimatedCost}</div>
                </div>
                <div>
                  <span className="text-gray-500">能耗:</span>
                  <div className="font-medium">{selectedSchedule.resources.energyConsumption}kWh</div>
                </div>
              </div>
            </div>

            {/* 通知设置 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">通知设置</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">提前通知:</span>
                  <div className="font-medium">{selectedSchedule.notifications.beforeStart}分钟</div>
                </div>
                <div>
                  <span className="text-gray-500">完成通知:</span>
                  <div className="font-medium">{selectedSchedule.notifications.onCompletion ? '是' : '否'}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">接收人:</span>
                  <div className="font-medium">{selectedSchedule.notifications.recipients.join(', ')}</div>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            {selectedSchedule.status === 'draft' && (
              <Button onClick={() => handleScheduleAction(selectedSchedule.id, 'start')}>
                <Play className="h-4 w-4 mr-2" />
                启动调度
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default TaskScheduling;
