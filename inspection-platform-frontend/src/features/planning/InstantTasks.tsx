import React, { useState } from 'react';
import {
  Plus,
  Search,
  Play,
  Pause,
  Square,
  Edit,
  Trash2,
  Clock,
  MapPin,
  User,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 即时任务类型定义
interface InstantTask {
  id: string;
  name: string;
  description: string;
  deviceId: string;
  deviceName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  assignedTo: string;
  estimatedDuration: number; // 分钟
  actualDuration?: number; // 分钟
  targets: {
    id: string;
    name: string;
    location: { lat: number; lng: number };
    completed: boolean;
  }[];
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  notes: string;
}

// Mock数据
const mockInstantTasks: InstantTask[] = [
  {
    id: 'instant-1',
    name: '紧急设备检查',
    description: '对A区域设备进行紧急安全检查',
    deviceId: 'device-1',
    deviceName: '巡检无人机-01',
    priority: 'urgent',
    status: 'running',
    assignedTo: '张工程师',
    estimatedDuration: 30,
    actualDuration: 15,
    targets: [
      { id: 'target-1', name: '变压器A1', location: { lat: 39.9042, lng: 116.4074 }, completed: true },
      { id: 'target-2', name: '配电箱B2', location: { lat: 39.9052, lng: 116.4084 }, completed: false },
      { id: 'target-3', name: '监控点C3', location: { lat: 39.9062, lng: 116.4094 }, completed: false }
    ],
    progress: 33,
    createdAt: '2024-07-17T09:00:00Z',
    startedAt: '2024-07-17T09:05:00Z',
    notes: '发现异常声音，需要重点检查'
  },
  {
    id: 'instant-2',
    name: '临时巡检任务',
    description: '响应客户投诉的临时巡检',
    deviceId: 'device-2',
    deviceName: '巡检机器人-02',
    priority: 'high',
    status: 'pending',
    assignedTo: '李技术员',
    estimatedDuration: 45,
    targets: [
      { id: 'target-4', name: '冷却塔D1', location: { lat: 39.9072, lng: 116.4104 }, completed: false },
      { id: 'target-5', name: '水泵房E2', location: { lat: 39.9082, lng: 116.4114 }, completed: false }
    ],
    progress: 0,
    createdAt: '2024-07-17T10:30:00Z',
    notes: '客户反映有异常噪音'
  },
  {
    id: 'instant-3',
    name: '设备故障排查',
    description: '针对报警设备的故障排查',
    deviceId: 'device-3',
    deviceName: '高清摄像头-03',
    priority: 'medium',
    status: 'completed',
    assignedTo: '王维护员',
    estimatedDuration: 20,
    actualDuration: 25,
    targets: [
      { id: 'target-6', name: '监控点F1', location: { lat: 39.9092, lng: 116.4124 }, completed: true }
    ],
    progress: 100,
    createdAt: '2024-07-17T08:00:00Z',
    startedAt: '2024-07-17T08:10:00Z',
    completedAt: '2024-07-17T08:35:00Z',
    notes: '已完成故障排查，设备正常'
  }
];

// 任务表单组件
interface TaskFormProps {
  task?: InstantTask;
  onSubmit: (task: Partial<InstantTask>) => void;
  onCancel: () => void;
}

function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const [formData, setFormData] = useState({
    name: task?.name || '',
    description: task?.description || '',
    deviceId: task?.deviceId || '',
    priority: task?.priority || 'medium',
    assignedTo: task?.assignedTo || '',
    estimatedDuration: task?.estimatedDuration || 30,
    notes: task?.notes || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock设备数据
  const devices = [
    { value: 'device-1', label: '巡检无人机-01' },
    { value: 'device-2', label: '巡检机器人-02' },
    { value: 'device-3', label: '高清摄像头-03' },
    { value: 'device-4', label: '环境传感器-04' }
  ];

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'urgent', label: '紧急' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '任务名称不能为空';
    }
    if (!formData.deviceId) {
      newErrors.deviceId = '请选择执行设备';
    }
    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = '请指定负责人';
    }
    if (formData.estimatedDuration <= 0) {
      newErrors.estimatedDuration = '预计时长必须大于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const selectedDevice = devices.find(d => d.value === formData.deviceId);
    const taskData: Partial<InstantTask> = {
      ...formData,
      deviceName: selectedDevice?.label,
      status: task?.status || 'pending',
      progress: task?.progress || 0,
      targets: task?.targets || [],
      createdAt: task?.createdAt || new Date().toISOString()
    };

    if (task) {
      taskData.id = task.id;
    } else {
      taskData.id = `instant-${Date.now()}`;
    }

    onSubmit(taskData);
  };

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

        <FormField label="优先级" error={errors.priority}>
          <Select
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as InstantTask['priority'] })}
            options={priorityOptions}
          />
        </FormField>

        <FormField label="负责人" required error={errors.assignedTo}>
          <Input
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            placeholder="请输入负责人"
          />
        </FormField>

        <FormField label="预计时长(分钟)" required error={errors.estimatedDuration}>
          <Input
            type="number"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
            placeholder="请输入预计时长"
          />
        </FormField>
      </div>

      <FormField label="任务描述">
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请输入任务描述"
          rows={3}
        />
      </FormField>

      <FormField label="备注">
        <TextArea
          value={formData.notes}
          onChange={(value) => setFormData({ ...formData, notes: value })}
          placeholder="请输入备注信息"
          rows={2}
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {task ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function InstantTasks() {
  const [tasks, setTasks] = useState<InstantTask[]>(mockInstantTasks);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  
  // 模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<InstantTask | null>(null);

  // 筛选任务
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // 事件处理函数
  const handleAddTask = (taskData: Partial<InstantTask>) => {
    setTasks([...tasks, taskData as InstantTask]);
    setShowAddModal(false);
  };

  const handleUpdateTask = (taskData: Partial<InstantTask>) => {
    if (selectedTask?.id) {
      setTasks(tasks.map(t => 
        t.id === selectedTask.id ? { ...t, ...taskData } : t
      ));
      setShowEditModal(false);
      setSelectedTask(null);
    }
  };

  const handleDeleteTask = () => {
    if (selectedTask?.id) {
      setTasks(tasks.filter(t => t.id !== selectedTask.id));
      setShowDeleteModal(false);
      setSelectedTask(null);
    }
  };

  const handleStartTask = (task: InstantTask) => {
    setTasks(tasks.map(t => 
      t.id === task.id 
        ? { ...t, status: 'running', startedAt: new Date().toISOString() }
        : t
    ));
  };

  const handlePauseTask = (task: InstantTask) => {
    setTasks(tasks.map(t => 
      t.id === task.id 
        ? { ...t, status: 'pending' }
        : t
    ));
  };

  const handleStopTask = (task: InstantTask) => {
    setTasks(tasks.map(t => 
      t.id === task.id 
        ? { 
            ...t, 
            status: 'cancelled',
            completedAt: new Date().toISOString(),
            actualDuration: task.startedAt 
              ? Math.round((new Date().getTime() - new Date(task.startedAt).getTime()) / 60000)
              : undefined
          }
        : t
    ));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const priorityMap: Record<string, string> = {
      urgent: '紧急',
      high: '高',
      medium: '中',
      low: '低'
    };
    return priorityMap[priority] || priority;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">即时任务</h1>
        <p className="text-gray-600 mt-1">创建和管理即时巡检任务</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">任务总数</p>
                <p className="text-2xl font-bold">{tasks.length}</p>
              </div>
              <Zap className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">进行中</p>
                <p className="text-2xl font-bold text-green-600">
                  {tasks.filter(t => t.status === 'running').length}
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
                <p className="text-sm text-gray-600">待执行</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {tasks.filter(t => t.status === 'pending').length}
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
                <p className="text-sm text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-purple-600">
                  {tasks.filter(t => t.status === 'completed').length}
                </p>
              </div>
              <Square className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>即时任务列表</CardTitle>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建任务
            </Button>
          </div>
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
                { value: 'pending', label: '待执行' },
                { value: 'running', label: '进行中' },
                { value: 'completed', label: '已完成' },
                { value: 'failed', label: '失败' },
                { value: 'cancelled', label: '已取消' }
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={setPriorityFilter}
              options={[
                { value: 'all', label: '全部优先级' },
                { value: 'urgent', label: '紧急' },
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' }
              ]}
            />
          </div>

          {/* 任务表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务名称</TableHead>
                <TableHead>设备</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>创建时间</TableHead>
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
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{task.deviceName}</div>
                      <div className="text-gray-500">预计 {task.estimatedDuration}分钟</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(task.priority)}`}>
                      {getPriorityLabel(task.priority)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1 text-gray-400" />
                      {task.assignedTo}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' :
                            task.status === 'failed' ? 'bg-red-500' :
                            'bg-blue-500'
                          }`}
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{task.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>{formatRelativeTime(task.createdAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {task.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartTask(task)}
                          className="text-green-600 hover:text-green-700"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                      )}
                      {task.status === 'running' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePauseTask(task)}
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStopTask(task)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </>
                      )}
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
                        onClick={() => {
                          setSelectedTask(task);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-700"
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

      {/* 添加任务模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="创建即时任务"
        size="lg"
      >
        <TaskForm
          onSubmit={handleAddTask}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 编辑任务模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        title="编辑即时任务"
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

export default InstantTasks;
