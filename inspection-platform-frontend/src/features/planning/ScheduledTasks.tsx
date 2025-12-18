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
import { MapSelection, Point, InspectionItem } from './components/MapSelection';

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
    inspectionItems?: InspectionItem[];
  }[];
  mapPoints?: Point[];
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
    deviceName: '巡检机器狗-01',
    status: 'active',
    priority: 'medium',
    assignedTo: '张工程师',
    schedule: {
      type: 'daily',
      time: '09:00',
      startDate: '2024-07-01T10:00:00Z'
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
    status: 'active',
    priority: 'high',
    assignedTo: '李技术员',
    schedule: {
      type: 'weekly',
      time: '10:00',
      startDate: '2024-06-15T14:00:00Z',
      daysOfWeek: [1]
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

interface TaskFormProps {
  task?: ScheduledTask;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    name: task?.name || '',
    description: task?.description || '',
    deviceId: task?.deviceId || '',
    priority: task?.priority || 'medium',
    assignedTo: task?.assignedTo || '',
    scheduleType: task?.schedule.type || 'daily',
    scheduleTime: task?.schedule.time || '09:00',
    estimatedDuration: task?.estimatedDuration || 30,
    notes: task?.notes || '',
    mapPoints: task?.mapPoints || [] as Point[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = '任务名称不能为空';
    if (!formData.deviceId) newErrors.deviceId = '请选择执行设备';
    if (formData.estimatedDuration <= 0) newErrors.estimatedDuration = '预计时长必须大于0';
    if (formData.mapPoints.length === 0) newErrors.mapPoints = '请至少选择一个巡检点';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit(formData);
  };

  // Mock设备数据
  const devices = [
    { value: 'device-1', label: '巡检无人机-01' },
    { value: 'device-2', label: '巡检机器人-02' },
    { value: 'device-3', label: '高清摄像头-03' },
  ];

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="任务名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入任务名称"
          />
        </FormField>

        <FormField label="执行设备" required error={errors.deviceId}>
          <Select
            value={formData.deviceId}
            onChange={(value) => setFormData({ ...formData, deviceId: value })}
            options={devices}
            placeholder="请选择执行设备"
          />
        </FormField>

        <FormField label="优先级">
          <Select
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as any })}
            options={[
              { value: 'low', label: '低' },
              { value: 'medium', label: '中' },
              { value: 'high', label: '高' },
              { value: 'urgent', label: '紧急' }
            ]}
          />
        </FormField>

        <FormField label="预计时长(分钟)" required error={errors.estimatedDuration}>
          <Input
            type="number"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
          />
        </FormField>

        <FormField label="调度类型">
          <Select
            value={formData.scheduleType}
            onChange={(value) => setFormData({ ...formData, scheduleType: value as any })}
            options={[
              { value: 'once', label: '单次' },
              { value: 'daily', label: '每天' },
              { value: 'weekly', label: '每周' },
              { value: 'monthly', label: '每月' }
            ]}
          />
        </FormField>

        <FormField label="执行时间">
          <Input
            type="time"
            value={formData.scheduleTime}
            onChange={(e) => setFormData({ ...formData, scheduleTime: e.target.value })}
          />
        </FormField>
      </div>

      <div className="mb-4">
        <MapSelection
          value={formData.mapPoints}
          onChange={(points) => setFormData({ ...formData, mapPoints: points })}
        />
        {errors.mapPoints && (
          <p className="text-sm text-red-500 mt-1">{errors.mapPoints}</p>
        )}
      </div>

      <FormField label="任务描述">
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          rows={3}
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>取消</Button>
        <Button type="submit">{task ? '更新' : '创建'}</Button>
      </ModalFooter>
    </Form>
  );
}

function ScheduledTasks() {
  const [tasks, setTasks] = useState<ScheduledTask[]>(mockScheduledTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<ScheduledTask | null>(null);

  const handleCreateTask = (formData: any) => {
    // Convert mapPoints to targets
    const targets = formData.mapPoints.map((point: Point) => ({
      id: point.id,
      name: point.name,
      location: {
        lat: 39.9042 + (point.y / 100) * 0.01,
        lng: 116.4074 + (point.x / 100) * 0.01
      },
      inspectionItems: point.inspectionItems
    }));

    const newTask: ScheduledTask = {
      id: `task-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      deviceId: formData.deviceId,
      deviceName: '未知设备',
      priority: formData.priority as any,
      status: 'active',
      assignedTo: formData.assignedTo || '未分配',
      schedule: {
        type: formData.scheduleType as any,
        time: formData.scheduleTime,
        startDate: new Date().toISOString()
      },
      estimatedDuration: formData.estimatedDuration,
      targets: targets,
      mapPoints: formData.mapPoints,
      nextExecution: new Date().toISOString(),
      executionCount: 0,
      successRate: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: formData.notes
    };

    setTasks([...tasks, newTask]);
    setShowCreateModal(false);
  };

  const handleUpdateTask = (formData: any) => {
    if (!selectedTask) return;

    const updatedTasks = tasks.map(t => {
      if (t.id === selectedTask.id) {
        return {
          ...t,
          name: formData.name,
          description: formData.description,
          deviceId: formData.deviceId,
          priority: formData.priority,
          assignedTo: formData.assignedTo,
          schedule: {
            ...t.schedule,
            type: formData.scheduleType,
            time: formData.scheduleTime
          },
          estimatedDuration: formData.estimatedDuration,
          mapPoints: formData.mapPoints,
          notes: formData.notes,
          updatedAt: new Date().toISOString()
        };
      }
      return t;
    });

    setTasks(updatedTasks);
    setShowEditModal(false);
    setSelectedTask(null);
  };

  const handleDeleteTask = () => {
    if (!selectedTask) return;
    setTasks(tasks.filter(t => t.id !== selectedTask.id));
    setShowDeleteModal(false);
    setSelectedTask(null);
  };

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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDeleteModal(true);
                        }}
                      >
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

      {/* 创建任务模态框 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建计划任务"
        size="lg"
      >
        <TaskForm
          onSubmit={handleCreateTask}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* 编辑任务模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        title="编辑计划任务"
        size="lg"
      >
        <TaskForm
          task={selectedTask || undefined}
          onSubmit={handleUpdateTask}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedTask(null);
          }}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTask(null);
        }}
        onConfirm={handleDeleteTask}
        title="删除任务"
        message={`确定要删除任务 "${selectedTask?.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default ScheduledTasks;
