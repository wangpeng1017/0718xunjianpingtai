import React, { useState, useEffect } from 'react';
import {
  Wrench,
  Calendar,
  Clock,
  User,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Wrench,
  Package,
  TrendingUp,
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

// 设备维护类型定义
interface DeviceMaintenance {
  id: string;
  deviceId: string;
  deviceName: string;
  deviceType: string;
  maintenanceType: 'preventive' | 'corrective' | 'predictive' | 'emergency';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'overdue';
  title: string;
  description: string;
  schedule: {
    plannedDate: string;
    estimatedDuration: number; // minutes
    frequency?: 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    nextDue?: string;
  };
  assignment: {
    technician: string;
    team: string;
    supervisor: string;
  };
  tasks: {
    id: string;
    name: string;
    description: string;
    status: 'pending' | 'in_progress' | 'completed' | 'skipped';
    estimatedTime: number;
    actualTime?: number;
    notes?: string;
  }[];
  resources: {
    tools: string[];
    parts: {
      name: string;
      quantity: number;
      cost: number;
      supplier?: string;
    }[];
    totalCost: number;
  };
  execution: {
    startedAt?: string;
    completedAt?: string;
    actualDuration?: number;
    issues: {
      id: string;
      description: string;
      severity: 'low' | 'medium' | 'high';
      resolved: boolean;
      resolution?: string;
    }[];
    photos: string[];
    documents: string[];
  };
  results: {
    outcome: 'successful' | 'partial' | 'failed';
    effectiveness: number; // 1-10 scale
    recommendations: string[];
    nextMaintenanceDate?: string;
    followUpRequired: boolean;
  };
  history: {
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    changes: {
      timestamp: string;
      user: string;
      action: string;
      details: string;
    }[];
  };
}

// Mock数据
const mockMaintenances: DeviceMaintenance[] = [
  {
    id: 'maint-1',
    deviceId: 'device-1',
    deviceName: '巡检无人机-01',
    deviceType: '无人机',
    maintenanceType: 'preventive',
    priority: 'medium',
    status: 'planned',
    title: '月度预防性维护',
    description: '执行月度例行维护检查，包括电池检测、螺旋桨检查、传感器校准等',
    schedule: {
      plannedDate: '2024-07-20T09:00:00Z',
      estimatedDuration: 120,
      frequency: 'monthly',
      nextDue: '2024-08-20T09:00:00Z'
    },
    assignment: {
      technician: '张维护员',
      team: '设备维护组',
      supervisor: '李主管'
    },
    tasks: [
      {
        id: 'task-1',
        name: '电池系统检查',
        description: '检查电池电压、容量和充电性能',
        status: 'pending',
        estimatedTime: 30
      },
      {
        id: 'task-2',
        name: '螺旋桨检查',
        description: '检查螺旋桨磨损情况和平衡性',
        status: 'pending',
        estimatedTime: 20
      },
      {
        id: 'task-3',
        name: '传感器校准',
        description: '校准温度、湿度、气压传感器',
        status: 'pending',
        estimatedTime: 45
      },
      {
        id: 'task-4',
        name: '软件更新',
        description: '检查并更新固件和控制软件',
        status: 'pending',
        estimatedTime: 25
      }
    ],
    resources: {
      tools: ['万用表', '螺旋桨平衡器', '校准设备', '电脑'],
      parts: [
        {
          name: '备用螺旋桨',
          quantity: 2,
          cost: 150.0,
          supplier: '大疆科技'
        },
        {
          name: '密封圈',
          quantity: 4,
          cost: 20.0,
          supplier: '本地供应商'
        }
      ],
      totalCost: 170.0
    },
    execution: {
      issues: [],
      photos: [],
      documents: []
    },
    results: {
      outcome: 'successful',
      effectiveness: 0,
      recommendations: [],
      followUpRequired: false
    },
    history: {
      createdAt: '2024-07-15T10:00:00Z',
      createdBy: '李主管',
      updatedAt: '2024-07-17T14:30:00Z',
      updatedBy: '张维护员',
      changes: [
        {
          timestamp: '2024-07-15T10:00:00Z',
          user: '李主管',
          action: '创建维护计划',
          details: '创建月度预防性维护计划'
        },
        {
          timestamp: '2024-07-17T14:30:00Z',
          user: '张维护员',
          action: '更新资源清单',
          details: '添加备用螺旋桨和密封圈'
        }
      ]
    }
  },
  {
    id: 'maint-2',
    deviceId: 'device-2',
    deviceName: '巡检机器人-02',
    deviceType: '地面机器人',
    maintenanceType: 'corrective',
    priority: 'high',
    status: 'in_progress',
    title: '电机故障修复',
    description: '修复左侧驱动电机异常噪音和振动问题',
    schedule: {
      plannedDate: '2024-07-17T13:00:00Z',
      estimatedDuration: 180
    },
    assignment: {
      technician: '王技术员',
      team: '机械维修组',
      supervisor: '李主管'
    },
    tasks: [
      {
        id: 'task-5',
        name: '故障诊断',
        description: '分析电机异常噪音和振动的原因',
        status: 'completed',
        estimatedTime: 45,
        actualTime: 50,
        notes: '发现轴承磨损严重'
      },
      {
        id: 'task-6',
        name: '拆卸电机',
        description: '安全拆卸左侧驱动电机',
        status: 'completed',
        estimatedTime: 30,
        actualTime: 35
      },
      {
        id: 'task-7',
        name: '更换轴承',
        description: '更换磨损的轴承组件',
        status: 'in_progress',
        estimatedTime: 60
      },
      {
        id: 'task-8',
        name: '重新组装',
        description: '重新组装电机并进行测试',
        status: 'pending',
        estimatedTime: 45
      }
    ],
    resources: {
      tools: ['扳手套装', '轴承拉拔器', '润滑油', '测试设备'],
      parts: [
        {
          name: '深沟球轴承6205',
          quantity: 2,
          cost: 80.0,
          supplier: 'SKF'
        },
        {
          name: '密封垫片',
          quantity: 1,
          cost: 15.0,
          supplier: '本地供应商'
        }
      ],
      totalCost: 95.0
    },
    execution: {
      startedAt: '2024-07-17T13:00:00Z',
      issues: [
        {
          id: 'issue-1',
          description: '轴承磨损比预期严重',
          severity: 'medium',
          resolved: true,
          resolution: '更换了额外的密封件'
        }
      ],
      photos: ['motor_before.jpg', 'bearing_damage.jpg'],
      documents: ['maintenance_report.pdf']
    },
    results: {
      outcome: 'successful',
      effectiveness: 0,
      recommendations: [],
      followUpRequired: true
    },
    history: {
      createdAt: '2024-07-17T10:30:00Z',
      createdBy: '系统自动',
      updatedAt: '2024-07-17T15:45:00Z',
      updatedBy: '王技术员',
      changes: [
        {
          timestamp: '2024-07-17T10:30:00Z',
          user: '系统自动',
          action: '创建紧急维护',
          details: '检测到电机异常，自动创建维护任务'
        },
        {
          timestamp: '2024-07-17T13:00:00Z',
          user: '王技术员',
          action: '开始维护',
          details: '开始执行电机维修任务'
        },
        {
          timestamp: '2024-07-17T15:45:00Z',
          user: '王技术员',
          action: '更新进度',
          details: '完成故障诊断和电机拆卸'
        }
      ]
    }
  },
  {
    id: 'maint-3',
    deviceId: 'device-3',
    deviceName: '环境监测站-03',
    deviceType: '监测设备',
    maintenanceType: 'predictive',
    priority: 'low',
    status: 'completed',
    title: '传感器精度校准',
    description: '基于AI预测分析，提前校准温湿度传感器',
    schedule: {
      plannedDate: '2024-07-16T14:00:00Z',
      estimatedDuration: 90
    },
    assignment: {
      technician: '刘校准员',
      team: '仪表校准组',
      supervisor: '陈工程师'
    },
    tasks: [
      {
        id: 'task-9',
        name: '传感器检测',
        description: '检测传感器当前精度状态',
        status: 'completed',
        estimatedTime: 30,
        actualTime: 25
      },
      {
        id: 'task-10',
        name: '校准操作',
        description: '使用标准设备进行校准',
        status: 'completed',
        estimatedTime: 45,
        actualTime: 50
      },
      {
        id: 'task-11',
        name: '验证测试',
        description: '验证校准后的精度',
        status: 'completed',
        estimatedTime: 15,
        actualTime: 12
      }
    ],
    resources: {
      tools: ['标准温湿度计', '校准软件', '数据记录器'],
      parts: [],
      totalCost: 0
    },
    execution: {
      startedAt: '2024-07-16T14:00:00Z',
      completedAt: '2024-07-16T15:27:00Z',
      actualDuration: 87,
      issues: [],
      photos: ['calibration_before.jpg', 'calibration_after.jpg'],
      documents: ['calibration_certificate.pdf']
    },
    results: {
      outcome: 'successful',
      effectiveness: 9,
      recommendations: [
        '建议每季度进行一次校准',
        '考虑升级到更高精度的传感器'
      ],
      nextMaintenanceDate: '2024-10-16T14:00:00Z',
      followUpRequired: false
    },
    history: {
      createdAt: '2024-07-15T09:00:00Z',
      createdBy: 'AI预测系统',
      updatedAt: '2024-07-16T15:30:00Z',
      updatedBy: '刘校准员',
      changes: [
        {
          timestamp: '2024-07-15T09:00:00Z',
          user: 'AI预测系统',
          action: '创建预测性维护',
          details: 'AI分析预测传感器精度将下降'
        },
        {
          timestamp: '2024-07-16T14:00:00Z',
          user: '刘校准员',
          action: '开始维护',
          details: '开始传感器校准工作'
        },
        {
          timestamp: '2024-07-16T15:30:00Z',
          user: '刘校准员',
          action: '完成维护',
          details: '校准完成，精度恢复正常'
        }
      ]
    }
  }
];

// 维护表单组件
interface MaintenanceFormProps {
  maintenance?: DeviceMaintenance;
  onSubmit: (maintenance: Partial<DeviceMaintenance>) => void;
  onCancel: () => void;
}

function MaintenanceForm({ maintenance, onSubmit, onCancel }: MaintenanceFormProps) {
  const [formData, setFormData] = useState({
    deviceId: maintenance?.deviceId || '',
    deviceName: maintenance?.deviceName || '',
    maintenanceType: maintenance?.maintenanceType || 'preventive',
    priority: maintenance?.priority || 'medium',
    title: maintenance?.title || '',
    description: maintenance?.description || '',
    plannedDate: maintenance?.schedule?.plannedDate?.split('T')[0] || '',
    plannedTime: maintenance?.schedule?.plannedDate?.split('T')[1]?.slice(0, 5) || '09:00',
    estimatedDuration: maintenance?.schedule?.estimatedDuration || 60,
    technician: maintenance?.assignment?.technician || '',
    team: maintenance?.assignment?.team || '',
    frequency: maintenance?.schedule?.frequency || 'monthly'
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const maintenanceTypeOptions = [
    { value: 'preventive', label: '预防性维护' },
    { value: 'corrective', label: '纠正性维护' },
    { value: 'predictive', label: '预测性维护' },
    { value: 'emergency', label: '紧急维护' }
  ];

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '关键' }
  ];

  const frequencyOptions = [
    { value: 'weekly', label: '每周' },
    { value: 'monthly', label: '每月' },
    { value: 'quarterly', label: '每季度' },
    { value: 'yearly', label: '每年' },
    { value: 'custom', label: '自定义' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.deviceName.trim()) {
      newErrors.deviceName = '设备名称不能为空';
    }
    if (!formData.title.trim()) {
      newErrors.title = '维护标题不能为空';
    }
    if (!formData.description.trim()) {
      newErrors.description = '维护描述不能为空';
    }
    if (!formData.plannedDate) {
      newErrors.plannedDate = '计划日期不能为空';
    }
    if (!formData.technician.trim()) {
      newErrors.technician = '技术员不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const maintenanceData: Partial<DeviceMaintenance> = {
      ...formData,
      schedule: {
        plannedDate: `${formData.plannedDate}T${formData.plannedTime}:00Z`,
        estimatedDuration: formData.estimatedDuration,
        frequency: formData.frequency as any
      },
      assignment: {
        technician: formData.technician,
        team: formData.team,
        supervisor: maintenance?.assignment?.supervisor || '当前用户'
      },
      tasks: maintenance?.tasks || [],
      resources: maintenance?.resources || {
        tools: [],
        parts: [],
        totalCost: 0
      },
      execution: maintenance?.execution || {
        issues: [],
        photos: [],
        documents: []
      },
      results: maintenance?.results || {
        outcome: 'successful',
        effectiveness: 0,
        recommendations: [],
        followUpRequired: false
      },
      status: 'planned',
      history: {
        createdAt: maintenance?.history?.createdAt || new Date().toISOString(),
        createdBy: maintenance?.history?.createdBy || '当前用户',
        updatedAt: new Date().toISOString(),
        updatedBy: '当前用户',
        changes: maintenance?.history?.changes || []
      }
    };

    if (maintenance) {
      maintenanceData.id = maintenance.id;
    } else {
      maintenanceData.id = `maint-${Date.now()}`;
    }

    onSubmit(maintenanceData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="设备名称" required error={errors.deviceName}>
          <Input
            value={formData.deviceName}
            onChange={(e) => setFormData({ ...formData, deviceName: e.target.value })}
            placeholder="请输入设备名称"
          />
        </FormField>

        <FormField label="维护类型">
          <Select
            value={formData.maintenanceType}
            onChange={(value) => setFormData({ ...formData, maintenanceType: value as DeviceMaintenance['maintenanceType'] })}
            options={maintenanceTypeOptions}
          />
        </FormField>

        <FormField label="优先级">
          <Select
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as DeviceMaintenance['priority'] })}
            options={priorityOptions}
          />
        </FormField>

        <FormField label="维护频率">
          <Select
            value={formData.frequency}
            onChange={(value) => setFormData({ ...formData, frequency: value })}
            options={frequencyOptions}
          />
        </FormField>

        <FormField label="计划日期" required error={errors.plannedDate}>
          <Input
            type="date"
            value={formData.plannedDate}
            onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
          />
        </FormField>

        <FormField label="计划时间">
          <Input
            type="time"
            value={formData.plannedTime}
            onChange={(e) => setFormData({ ...formData, plannedTime: e.target.value })}
          />
        </FormField>

        <FormField label="预计时长(分钟)">
          <Input
            type="number"
            min="1"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 60 })}
          />
        </FormField>

        <FormField label="负责技术员" required error={errors.technician}>
          <Input
            value={formData.technician}
            onChange={(e) => setFormData({ ...formData, technician: e.target.value })}
            placeholder="请输入技术员姓名"
          />
        </FormField>
      </div>

      <FormField label="维护标题" required error={errors.title}>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="请输入维护标题"
        />
      </FormField>

      <FormField label="维护描述" required error={errors.description}>
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请详细描述维护内容和要求"
          rows={4}
        />
      </FormField>

      <FormField label="维护团队">
        <Input
          value={formData.team}
          onChange={(e) => setFormData({ ...formData, team: e.target.value })}
          placeholder="请输入维护团队"
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {maintenance ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function DeviceMaintenance() {
  const [maintenances, setMaintenances] = useState<DeviceMaintenance[]>(mockMaintenances);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedMaintenance, setSelectedMaintenance] = useState<DeviceMaintenance | null>(null);
  
  // 模态框状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 自动更新维护状态
  useEffect(() => {
    const interval = setInterval(() => {
      setMaintenances(prev => prev.map(maintenance => {
        const now = new Date();
        const plannedDate = new Date(maintenance.schedule.plannedDate);
        
        // 检查是否过期
        if (maintenance.status === 'planned' && now > plannedDate) {
          return { ...maintenance, status: 'overdue' };
        }
        
        // 模拟进行中的维护进度
        if (maintenance.status === 'in_progress') {
          const updatedTasks = maintenance.tasks.map(task => {
            if (task.status === 'in_progress' && Math.random() > 0.7) {
              return { ...task, status: 'completed', actualTime: task.estimatedTime + Math.floor(Math.random() * 10) };
            }
            return task;
          });
          
          return { ...maintenance, tasks: updatedTasks };
        }
        
        return maintenance;
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // 筛选维护记录
  const filteredMaintenances = maintenances.filter(maintenance => {
    const matchesSearch = maintenance.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         maintenance.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || maintenance.maintenanceType === typeFilter;
    const matchesStatus = statusFilter === 'all' || maintenance.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || maintenance.priority === priorityFilter;
    
    return matchesSearch && matchesType && matchesStatus && matchesPriority;
  });

  // 事件处理函数
  const handleCreateMaintenance = (maintenanceData: Partial<DeviceMaintenance>) => {
    setMaintenances([maintenanceData as DeviceMaintenance, ...maintenances]);
    setShowCreateModal(false);
  };

  const handleUpdateMaintenance = (maintenanceData: Partial<DeviceMaintenance>) => {
    if (selectedMaintenance?.id) {
      setMaintenances(maintenances.map(m => 
        m.id === selectedMaintenance.id ? { ...m, ...maintenanceData } : m
      ));
      setShowEditModal(false);
      setSelectedMaintenance(null);
    }
  };

  const handleStatusChange = (maintenanceId: string, newStatus: DeviceMaintenance['status']) => {
    setMaintenances(maintenances.map(m => {
      if (m.id === maintenanceId) {
        const updatedMaintenance = { ...m, status: newStatus };
        
        // 更新执行信息
        if (newStatus === 'in_progress' && !m.execution.startedAt) {
          updatedMaintenance.execution.startedAt = new Date().toISOString();
        } else if (newStatus === 'completed' && !m.execution.completedAt) {
          updatedMaintenance.execution.completedAt = new Date().toISOString();
          updatedMaintenance.execution.actualDuration = Math.floor(
            (new Date().getTime() - new Date(m.execution.startedAt || new Date()).getTime()) / 60000
          );
        }
        
        return updatedMaintenance;
      }
      return m;
    }));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return Calendar;
      case 'corrective': return Wrench;
      case 'predictive': return TrendingUp;
      case 'emergency': return AlertTriangle;
      default: return Wrench;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      preventive: '预防性',
      corrective: '纠正性',
      predictive: '预测性',
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'overdue': return 'text-red-600';
      case 'planned': return 'text-gray-600';
      case 'cancelled': return 'text-gray-400';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">设备维护</h1>
        <p className="text-gray-600 mt-1">设备维护计划和执行管理</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">维护总数</p>
                <p className="text-2xl font-bold">{maintenances.length}</p>
              </div>
              <Wrench className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">进行中</p>
                <p className="text-2xl font-bold text-blue-600">
                  {maintenances.filter(m => m.status === 'in_progress').length}
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
                <p className="text-sm text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">
                  {maintenances.filter(m => m.status === 'completed').length}
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
                <p className="text-sm text-gray-600">总成本</p>
                <p className="text-2xl font-bold text-purple-600">
                  ¥{maintenances.reduce((sum, m) => sum + m.resources.totalCost, 0)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>设备维护列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                设置
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建维护
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
                  placeholder="搜索维护标题、设备名称或描述..."
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
                { value: 'preventive', label: '预防性' },
                { value: 'corrective', label: '纠正性' },
                { value: 'predictive', label: '预测性' },
                { value: 'emergency', label: '紧急' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'planned', label: '已计划' },
                { value: 'in_progress', label: '进行中' },
                { value: 'completed', label: '已完成' },
                { value: 'overdue', label: '已过期' },
                { value: 'cancelled', label: '已取消' }
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
          </div>

          {/* 维护表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>维护信息</TableHead>
                <TableHead>设备</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>计划时间</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>成本</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaintenances.map((maintenance) => {
                const TypeIcon = getTypeIcon(maintenance.maintenanceType);
                const completedTasks = maintenance.tasks.filter(t => t.status === 'completed').length;
                const totalTasks = maintenance.tasks.length;

                return (
                  <TableRow key={maintenance.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <TypeIcon className={`h-5 w-5 ${getStatusColor(maintenance.status)}`} />
                        <div>
                          <div className="font-medium">{maintenance.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {maintenance.description}
                          </div>
                          {maintenance.status === 'in_progress' && totalTasks > 0 && (
                            <div className="text-xs text-blue-600 mt-1">
                              进度: {completedTasks}/{totalTasks} 任务
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{maintenance.deviceName}</div>
                        <div className="text-sm text-gray-500">{maintenance.deviceType}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getTypeLabel(maintenance.maintenanceType)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(maintenance.priority)}`}>
                        {maintenance.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={maintenance.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatRelativeTime(maintenance.schedule.plannedDate)}</div>
                        <div className="text-gray-500">
                          {new Date(maintenance.schedule.plannedDate).toLocaleString('zh-CN', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{maintenance.assignment.technician}</div>
                        <div className="text-gray-500">{maintenance.assignment.team}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        ¥{maintenance.resources.totalCost}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMaintenance(maintenance);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {maintenance.status === 'planned' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(maintenance.id, 'in_progress')}
                            className="text-green-600 hover:text-green-700"
                          >
                            开始
                          </Button>
                        )}

                        {maintenance.status === 'in_progress' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(maintenance.id, 'completed')}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            完成
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedMaintenance(maintenance);
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

      {/* 创建维护模态框 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建设备维护"
        size="lg"
      >
        <MaintenanceForm
          onSubmit={handleCreateMaintenance}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* 编辑维护模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedMaintenance(null);
        }}
        title="编辑设备维护"
        size="lg"
      >
        <MaintenanceForm
          maintenance={selectedMaintenance || undefined}
          onSubmit={handleUpdateMaintenance}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedMaintenance(null);
          }}
        />
      </Modal>

      {/* 维护详情模态框 */}
      {selectedMaintenance && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedMaintenance(null);
          }}
          title="维护详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">维护标题:</span> {selectedMaintenance.title}</div>
                  <div><span className="text-gray-500">设备名称:</span> {selectedMaintenance.deviceName}</div>
                  <div><span className="text-gray-500">设备类型:</span> {selectedMaintenance.deviceType}</div>
                  <div><span className="text-gray-500">维护类型:</span> {getTypeLabel(selectedMaintenance.maintenanceType)}</div>
                  <div><span className="text-gray-500">优先级:</span> {selectedMaintenance.priority}</div>
                  <div><span className="text-gray-500">状态:</span> {selectedMaintenance.status}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">时间安排</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">计划时间:</span> {new Date(selectedMaintenance.schedule.plannedDate).toLocaleString('zh-CN')}</div>
                  <div><span className="text-gray-500">预计时长:</span> {selectedMaintenance.schedule.estimatedDuration}分钟</div>
                  {selectedMaintenance.schedule.frequency && (
                    <div><span className="text-gray-500">维护频率:</span> {selectedMaintenance.schedule.frequency}</div>
                  )}
                  {selectedMaintenance.execution.startedAt && (
                    <div><span className="text-gray-500">开始时间:</span> {new Date(selectedMaintenance.execution.startedAt).toLocaleString('zh-CN')}</div>
                  )}
                  {selectedMaintenance.execution.completedAt && (
                    <div><span className="text-gray-500">完成时间:</span> {new Date(selectedMaintenance.execution.completedAt).toLocaleString('zh-CN')}</div>
                  )}
                  {selectedMaintenance.execution.actualDuration && (
                    <div><span className="text-gray-500">实际时长:</span> {selectedMaintenance.execution.actualDuration}分钟</div>
                  )}
                </div>
              </div>
            </div>

            {/* 人员分配 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">人员分配</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">负责技术员:</span>
                  <div className="font-medium">{selectedMaintenance.assignment.technician}</div>
                </div>
                <div>
                  <span className="text-gray-500">维护团队:</span>
                  <div className="font-medium">{selectedMaintenance.assignment.team}</div>
                </div>
                <div>
                  <span className="text-gray-500">监督员:</span>
                  <div className="font-medium">{selectedMaintenance.assignment.supervisor}</div>
                </div>
              </div>
            </div>

            {/* 维护任务 */}
            {selectedMaintenance.tasks.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">维护任务</h4>
                <div className="space-y-2">
                  {selectedMaintenance.tasks.map((task, index) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{task.name}</div>
                          <div className="text-sm text-gray-500">{task.description}</div>
                          {task.notes && (
                            <div className="text-xs text-blue-600 mt-1">备注: {task.notes}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <StatusBadge status={task.status} />
                        <div className="text-gray-500 mt-1">
                          {task.actualTime ? `${task.actualTime}分钟` : `预计${task.estimatedTime}分钟`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 资源配置 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">资源配置</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">工具清单</h5>
                  {selectedMaintenance.resources.tools.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedMaintenance.resources.tools.map((tool, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                          {tool}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">无需特殊工具</p>
                  )}
                </div>
                <div>
                  <h5 className="text-sm font-medium text-gray-700 mb-2">备件清单</h5>
                  {selectedMaintenance.resources.parts.length > 0 ? (
                    <div className="space-y-1">
                      {selectedMaintenance.resources.parts.map((part, index) => (
                        <div key={index} className="text-xs bg-green-50 p-2 rounded">
                          <div className="font-medium">{part.name}</div>
                          <div className="text-gray-500">
                            数量: {part.quantity} | 成本: ¥{part.cost}
                            {part.supplier && ` | 供应商: ${part.supplier}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">无需更换备件</p>
                  )}
                </div>
              </div>
              <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                <div className="text-sm font-medium text-yellow-800">
                  总成本: ¥{selectedMaintenance.resources.totalCost}
                </div>
              </div>
            </div>

            {/* 执行问题 */}
            {selectedMaintenance.execution.issues.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">执行问题</h4>
                <div className="space-y-2">
                  {selectedMaintenance.execution.issues.map((issue) => (
                    <div key={issue.id} className={`p-3 rounded-lg border-l-4 ${
                      issue.severity === 'high' ? 'bg-red-50 border-red-400' :
                      issue.severity === 'medium' ? 'bg-yellow-50 border-yellow-400' :
                      'bg-blue-50 border-blue-400'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">{issue.description}</div>
                        <span className={`px-2 py-1 rounded text-xs ${
                          issue.resolved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {issue.resolved ? '已解决' : '未解决'}
                        </span>
                      </div>
                      {issue.resolution && (
                        <div className="text-sm text-gray-600 mt-1">
                          解决方案: {issue.resolution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 维护结果 */}
            {selectedMaintenance.status === 'completed' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">维护结果</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-blue-600 font-medium">执行结果</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {selectedMaintenance.results.outcome === 'successful' ? '成功' :
                       selectedMaintenance.results.outcome === 'partial' ? '部分' : '失败'}
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-medium">效果评分</div>
                    <div className="text-2xl font-bold text-green-800">
                      {selectedMaintenance.results.effectiveness}/10
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-purple-600 font-medium">后续跟进</div>
                    <div className="text-sm font-bold text-purple-800">
                      {selectedMaintenance.results.followUpRequired ? '需要' : '不需要'}
                    </div>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="text-yellow-600 font-medium">下次维护</div>
                    <div className="text-xs font-bold text-yellow-800">
                      {selectedMaintenance.results.nextMaintenanceDate
                        ? new Date(selectedMaintenance.results.nextMaintenanceDate).toLocaleDateString('zh-CN')
                        : '待定'
                      }
                    </div>
                  </div>
                </div>
                {selectedMaintenance.results.recommendations.length > 0 && (
                  <div className="mt-3">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">改进建议</h5>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedMaintenance.results.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-gray-600">{rec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* 变更历史 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">变更历史</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedMaintenance.history.changes.map((change, index) => (
                  <div key={index} className="flex items-start space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{change.action}</span>
                        <span className="text-gray-500">{formatRelativeTime(change.timestamp)}</span>
                      </div>
                      <div className="text-gray-600">{change.details}</div>
                      <div className="text-gray-400">by {change.user}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            <div className="flex space-x-2">
              {selectedMaintenance.status === 'planned' && (
                <Button onClick={() => {
                  handleStatusChange(selectedMaintenance.id, 'in_progress');
                  setShowDetailModal(false);
                }}>
                  开始维护
                </Button>
              )}
              {selectedMaintenance.status === 'in_progress' && (
                <Button onClick={() => {
                  handleStatusChange(selectedMaintenance.id, 'completed');
                  setShowDetailModal(false);
                }}>
                  完成维护
                </Button>
              )}
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                导出报告
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default DeviceMaintenance;
