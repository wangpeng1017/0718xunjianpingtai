import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Play, 
  Pause, 
  Square, 
  Eye,
  Edit,
  Trash2,
  Clock,
  MapPin,
  User
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useTasks, useTaskStore } from '../../stores/useTaskStore';
import { useDevices } from '../../stores/useDeviceStore';
import { generateMockTasks } from '../../mocks/data';
import { formatRelativeTime, getPriorityColor } from '../../lib/utils';
import type { InspectionTask, Device } from '../../types';

// 任务表单组件
interface TaskFormProps {
  task?: InspectionTask;
  onSubmit: (task: Partial<InspectionTask>) => void;
  onCancel: () => void;
}

function TaskForm({ task, onSubmit, onCancel }: TaskFormProps) {
  const devices = useDevices();
  const [formData, setFormData] = React.useState({
    name: task?.name || '',
    deviceId: task?.deviceId || '',
    priority: task?.priority || 'medium',
    assignedTo: task?.assignedTo || '',
    description: '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'urgent', label: '紧急' },
  ];

  const deviceOptions = devices.map(device => ({
    value: device.id,
    label: `${device.name} (${device.type})`,
    disabled: device.status !== 'online',
  }));

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '任务名称不能为空';
    }
    if (!formData.deviceId) {
      newErrors.deviceId = '请选择执行设备';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const selectedDevice = devices.find(d => d.id === formData.deviceId);
    const taskData: Partial<InspectionTask> = {
      ...formData,
      deviceName: selectedDevice?.name,
      status: task?.status || 'pending',
      progress: task?.progress || 0,
      route: task?.route || [],
      targets: task?.targets || [],
      createdAt: task?.createdAt || new Date().toISOString(),
    };

    if (task) {
      taskData.id = task.id;
    } else {
      taskData.id = `task-${Date.now()}`;
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
            options={deviceOptions}
            placeholder="请选择执行设备"
          />
        </FormField>

        <FormField label="优先级" error={errors.priority}>
          <Select
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as InspectionTask['priority'] })}
            options={priorityOptions}
          />
        </FormField>

        <FormField label="负责人" error={errors.assignedTo}>
          <Input
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            placeholder="请输入负责人"
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

function TaskList() {
  const tasks = useTasks();
  const devices = useDevices();
  const { setTasks, addTask, updateTask, removeTask, setSelectedTask, updateTaskStatus } = useTaskStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [priorityFilter, setPriorityFilter] = React.useState<string>('all');

  // 模态框状态
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [selectedTask, setSelectedTaskLocal] = React.useState<InspectionTask | null>(null);

  // 初始化任务数据
  React.useEffect(() => {
    if (tasks.length === 0) {
      setTasks(generateMockTasks(100));
    }
  }, [tasks.length, setTasks]);

  // 过滤任务
  const filteredTasks = React.useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.deviceName?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter]);

  // 状态统计
  const statusStats = React.useMemo(() => {
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'pending').length,
      running: tasks.filter(t => t.status === 'running').length,
      completed: tasks.filter(t => t.status === 'completed').length,
      failed: tasks.filter(t => t.status === 'failed').length,
      cancelled: tasks.filter(t => t.status === 'cancelled').length,
    };
  }, [tasks]);

  // 状态映射
  const statusMap = {
    pending: '待执行',
    running: '进行中',
    completed: '已完成',
    failed: '失败',
    cancelled: '已取消',
  };

  // 优先级映射
  const priorityMap = {
    low: '低',
    medium: '中',
    high: '高',
    urgent: '紧急',
  };

  const handleStartTask = (task: InspectionTask) => {
    updateTaskStatus(task.id, 'running', '任务已启动');
  };

  const handlePauseTask = (task: InspectionTask) => {
    updateTaskStatus(task.id, 'pending', '任务已暂停');
  };

  const handleStopTask = (task: InspectionTask) => {
    updateTaskStatus(task.id, 'cancelled', '任务已停止');
  };

  const handleViewTask = (task: InspectionTask) => {
    setSelectedTask(task);
    // TODO: 打开任务详情模态框
  };

  const handleEditTask = (task: InspectionTask) => {
    setSelectedTaskLocal(task);
    setShowEditModal(true);
  };

  const handleDeleteTask = (task: InspectionTask) => {
    setSelectedTaskLocal(task);
    setShowDeleteModal(true);
  };

  const handleAddTask = (taskData: Partial<InspectionTask>) => {
    addTask(taskData as InspectionTask);
    setShowAddModal(false);
  };

  const handleUpdateTask = (taskData: Partial<InspectionTask>) => {
    if (selectedTask?.id) {
      updateTask(selectedTask.id, taskData);
      setShowEditModal(false);
      setSelectedTaskLocal(null);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedTask?.id) {
      removeTask(selectedTask.id);
      setShowDeleteModal(false);
      setSelectedTaskLocal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">任务列表</h1>
          <p className="text-gray-600 mt-1">管理和监控所有巡检任务</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          创建任务
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">总任务</p>
              <p className="text-2xl font-bold">{statusStats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">待执行</p>
              <p className="text-2xl font-bold text-blue-600">{statusStats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">进行中</p>
              <p className="text-2xl font-bold text-purple-600">{statusStats.running}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">已完成</p>
              <p className="text-2xl font-bold text-green-600">{statusStats.completed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">失败</p>
              <p className="text-2xl font-bold text-red-600">{statusStats.failed}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">已取消</p>
              <p className="text-2xl font-bold text-gray-600">{statusStats.cancelled}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索任务名称或设备..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">所有状态</option>
              <option value="pending">待执行</option>
              <option value="running">进行中</option>
              <option value="completed">已完成</option>
              <option value="failed">失败</option>
              <option value="cancelled">已取消</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">所有优先级</option>
              <option value="urgent">紧急</option>
              <option value="high">高</option>
              <option value="medium">中</option>
              <option value="low">低</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 任务列表 */}
      <Card>
        <CardHeader>
          <CardTitle>任务列表 ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>任务信息</TableHead>
                <TableHead>设备</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>进度</TableHead>
                <TableHead>负责人</TableHead>
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
                      <div className="text-sm text-gray-500">ID: {task.id}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{task.deviceName}</div>
                      <div className="text-gray-500">{task.deviceId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.status} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={task.priority} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${task.progress}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{task.progress}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <User className="h-3 w-3 mr-1" />
                      {task.assignedTo || '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-600">
                      <div>{formatRelativeTime(task.createdAt)}</div>
                      <div className="text-xs text-gray-400">
                        {new Date(task.createdAt).toLocaleDateString('zh-CN')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      {task.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartTask(task)}
                          title="启动任务"
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
                            title="暂停任务"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStopTask(task)}
                            title="停止任务"
                          >
                            <Square className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTask(task)}
                        title="查看详情"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTask(task)}
                        title="编辑任务"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task)}
                        title="删除任务"
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
        title="创建任务"
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
          setSelectedTaskLocal(null);
        }}
        title="编辑任务"
        size="lg"
      >
        <TaskForm
          task={selectedTask || undefined}
          onSubmit={handleUpdateTask}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedTaskLocal(null);
          }}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTaskLocal(null);
        }}
        onConfirm={handleConfirmDelete}
        title="删除任务"
        message={`确定要删除任务 "${selectedTask?.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default TaskList;
