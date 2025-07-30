import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  XCircle,
  Clock,
  CheckCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  Bell,
  BellOff,
  User,
  Calendar,
  MapPin,
  Settings,
  RefreshCw,
  Send,
  MessageSquare,
  Zap,
  Activity
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 异常类型定义
interface Exception {
  id: string;
  title: string;
  description: string;
  type: 'device_failure' | 'sensor_error' | 'communication_loss' | 'performance_degradation' | 'safety_violation' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'acknowledged' | 'investigating' | 'resolved' | 'closed' | 'escalated';
  source: {
    type: 'device' | 'sensor' | 'system' | 'user';
    id: string;
    name: string;
    location?: {
      lat: number;
      lng: number;
      address: string;
    };
  };
  affectedTargets: string[];
  detectedAt: string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  assignedTo?: string;
  escalatedTo?: string;
  priority: number;
  impact: {
    scope: 'single_device' | 'multiple_devices' | 'area' | 'system_wide';
    affectedCount: number;
    businessImpact: 'none' | 'low' | 'medium' | 'high' | 'critical';
  };
  symptoms: string[];
  possibleCauses: string[];
  recommendedActions: string[];
  resolution?: {
    action: string;
    description: string;
    resolvedBy: string;
    resolvedAt: string;
    preventiveMeasures: string[];
  };
  relatedExceptions: string[];
  attachments: {
    id: string;
    name: string;
    type: 'image' | 'video' | 'log' | 'report';
    url: string;
  }[];
  notifications: {
    id: string;
    type: 'email' | 'sms' | 'push' | 'webhook';
    recipient: string;
    sentAt: string;
    status: 'sent' | 'delivered' | 'failed';
  }[];
  timeline: {
    id: string;
    timestamp: string;
    action: string;
    actor: string;
    details: string;
  }[];
}

// Mock数据
const mockExceptions: Exception[] = [
  {
    id: 'exc-1',
    title: '主变压器A1温度异常',
    description: '主变压器A1检测到温度持续升高，当前温度85°C，超出正常运行范围（60-75°C）',
    type: 'device_failure',
    severity: 'critical',
    status: 'investigating',
    source: {
      type: 'device',
      id: 'device-1',
      name: '巡检无人机-01',
      location: {
        lat: 39.9042,
        lng: 116.4074,
        address: '北京市朝阳区电力大厅A区'
      }
    },
    affectedTargets: ['target-1'],
    detectedAt: '2024-07-17T09:15:00Z',
    acknowledgedAt: '2024-07-17T09:18:00Z',
    assignedTo: '张工程师',
    priority: 1,
    impact: {
      scope: 'single_device',
      affectedCount: 1,
      businessImpact: 'high'
    },
    symptoms: [
      '温度传感器读数异常升高',
      '冷却风扇运行声音异常',
      '变压器外壳温度过高'
    ],
    possibleCauses: [
      '冷却系统故障',
      '负载过重',
      '绝缘老化',
      '环境温度过高'
    ],
    recommendedActions: [
      '立即检查冷却系统',
      '降低负载',
      '检查绝缘状态',
      '安排紧急维修'
    ],
    relatedExceptions: [],
    attachments: [
      {
        id: 'att-1',
        name: '温度趋势图.png',
        type: 'image',
        url: '/attachments/temp_trend.png'
      },
      {
        id: 'att-2',
        name: '巡检视频.mp4',
        type: 'video',
        url: '/attachments/inspection_video.mp4'
      }
    ],
    notifications: [
      {
        id: 'notif-1',
        type: 'email',
        recipient: '张工程师',
        sentAt: '2024-07-17T09:16:00Z',
        status: 'delivered'
      },
      {
        id: 'notif-2',
        type: 'sms',
        recipient: '李主管',
        sentAt: '2024-07-17T09:16:00Z',
        status: 'delivered'
      }
    ],
    timeline: [
      {
        id: 'tl-1',
        timestamp: '2024-07-17T09:15:00Z',
        action: '异常检测',
        actor: '系统',
        details: '温度传感器检测到异常高温'
      },
      {
        id: 'tl-2',
        timestamp: '2024-07-17T09:16:00Z',
        action: '发送通知',
        actor: '系统',
        details: '向相关人员发送紧急通知'
      },
      {
        id: 'tl-3',
        timestamp: '2024-07-17T09:18:00Z',
        action: '确认异常',
        actor: '张工程师',
        details: '确认收到异常通知，开始调查'
      }
    ]
  },
  {
    id: 'exc-2',
    title: '通信连接中断',
    description: '巡检机器人-02与控制中心失去通信连接，已超过5分钟无响应',
    type: 'communication_loss',
    severity: 'high',
    status: 'new',
    source: {
      type: 'device',
      id: 'device-2',
      name: '巡检机器人-02',
      location: {
        lat: 39.9052,
        lng: 116.4084,
        address: '北京市朝阳区电力大厅B区'
      }
    },
    affectedTargets: ['target-2'],
    detectedAt: '2024-07-17T09:25:00Z',
    priority: 2,
    impact: {
      scope: 'single_device',
      affectedCount: 1,
      businessImpact: 'medium'
    },
    symptoms: [
      '设备状态显示离线',
      '无法接收设备数据',
      '远程控制失效'
    ],
    possibleCauses: [
      '网络连接故障',
      '设备硬件故障',
      '信号干扰',
      '电源问题'
    ],
    recommendedActions: [
      '检查网络连接',
      '重启通信模块',
      '现场检查设备状态',
      '检查信号强度'
    ],
    relatedExceptions: [],
    attachments: [],
    notifications: [
      {
        id: 'notif-3',
        type: 'push',
        recipient: '运维组',
        sentAt: '2024-07-17T09:26:00Z',
        status: 'sent'
      }
    ],
    timeline: [
      {
        id: 'tl-4',
        timestamp: '2024-07-17T09:25:00Z',
        action: '通信中断检测',
        actor: '系统',
        details: '检测到设备通信超时'
      },
      {
        id: 'tl-5',
        timestamp: '2024-07-17T09:26:00Z',
        action: '发送警报',
        actor: '系统',
        details: '向运维组发送通信中断警报'
      }
    ]
  },
  {
    id: 'exc-3',
    title: '传感器数据异常',
    description: '安防机器人-03的振动传感器数据出现异常波动，可能存在硬件故障',
    type: 'sensor_error',
    severity: 'medium',
    status: 'resolved',
    source: {
      type: 'sensor',
      id: 'sensor-vibration-03',
      name: '振动传感器-03'
    },
    affectedTargets: ['target-3'],
    detectedAt: '2024-07-17T08:30:00Z',
    acknowledgedAt: '2024-07-17T08:35:00Z',
    resolvedAt: '2024-07-17T09:00:00Z',
    assignedTo: '王技术员',
    priority: 3,
    impact: {
      scope: 'single_device',
      affectedCount: 1,
      businessImpact: 'low'
    },
    symptoms: [
      '传感器读数不稳定',
      '数据超出正常范围',
      '间歇性数据丢失'
    ],
    possibleCauses: [
      '传感器老化',
      '连接松动',
      '环境干扰',
      '校准偏差'
    ],
    recommendedActions: [
      '重新校准传感器',
      '检查连接线路',
      '更换传感器',
      '环境检查'
    ],
    resolution: {
      action: '传感器重新校准',
      description: '对振动传感器进行重新校准，数据恢复正常',
      resolvedBy: '王技术员',
      resolvedAt: '2024-07-17T09:00:00Z',
      preventiveMeasures: [
        '定期校准传感器',
        '加强设备维护',
        '监控环境条件'
      ]
    },
    relatedExceptions: [],
    attachments: [
      {
        id: 'att-3',
        name: '传感器数据日志.log',
        type: 'log',
        url: '/attachments/sensor_log.log'
      }
    ],
    notifications: [
      {
        id: 'notif-4',
        type: 'email',
        recipient: '王技术员',
        sentAt: '2024-07-17T08:31:00Z',
        status: 'delivered'
      }
    ],
    timeline: [
      {
        id: 'tl-6',
        timestamp: '2024-07-17T08:30:00Z',
        action: '传感器异常检测',
        actor: '系统',
        details: '检测到振动传感器数据异常'
      },
      {
        id: 'tl-7',
        timestamp: '2024-07-17T08:35:00Z',
        action: '异常确认',
        actor: '王技术员',
        details: '确认传感器异常，开始处理'
      },
      {
        id: 'tl-8',
        timestamp: '2024-07-17T09:00:00Z',
        action: '问题解决',
        actor: '王技术员',
        details: '传感器重新校准完成，数据恢复正常'
      }
    ]
  }
];

// 异常处理表单组件
interface ExceptionFormProps {
  exception?: Exception;
  onSubmit: (exception: Partial<Exception>) => void;
  onCancel: () => void;
}

function ExceptionForm({ exception, onSubmit, onCancel }: ExceptionFormProps) {
  const [formData, setFormData] = useState({
    title: exception?.title || '',
    description: exception?.description || '',
    type: exception?.type || 'system_error',
    severity: exception?.severity || 'medium',
    assignedTo: exception?.assignedTo || '',
    symptoms: exception?.symptoms?.join('\n') || '',
    possibleCauses: exception?.possibleCauses?.join('\n') || '',
    recommendedActions: exception?.recommendedActions?.join('\n') || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const exceptionTypes = [
    { value: 'device_failure', label: '设备故障' },
    { value: 'sensor_error', label: '传感器错误' },
    { value: 'communication_loss', label: '通信中断' },
    { value: 'performance_degradation', label: '性能下降' },
    { value: 'safety_violation', label: '安全违规' },
    { value: 'system_error', label: '系统错误' }
  ];

  const severityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '关键' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = '异常标题不能为空';
    }
    if (!formData.description.trim()) {
      newErrors.description = '异常描述不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const exceptionData: Partial<Exception> = {
      ...formData,
      symptoms: formData.symptoms.split('\n').filter(s => s.trim()),
      possibleCauses: formData.possibleCauses.split('\n').filter(c => c.trim()),
      recommendedActions: formData.recommendedActions.split('\n').filter(a => a.trim()),
      status: exception?.status || 'new',
      detectedAt: exception?.detectedAt || new Date().toISOString(),
      priority: exception?.priority || 1,
      source: exception?.source || {
        type: 'system',
        id: 'system',
        name: '系统'
      },
      affectedTargets: exception?.affectedTargets || [],
      impact: exception?.impact || {
        scope: 'single_device',
        affectedCount: 1,
        businessImpact: 'medium'
      },
      relatedExceptions: exception?.relatedExceptions || [],
      attachments: exception?.attachments || [],
      notifications: exception?.notifications || [],
      timeline: exception?.timeline || []
    };

    if (exception) {
      exceptionData.id = exception.id;
    } else {
      exceptionData.id = `exc-${Date.now()}`;
    }

    onSubmit(exceptionData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="异常标题" required error={errors.title}>
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="请输入异常标题"
          />
        </FormField>

        <FormField label="异常类型">
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as Exception['type'] })}
            options={exceptionTypes}
          />
        </FormField>

        <FormField label="严重程度">
          <Select
            value={formData.severity}
            onChange={(value) => setFormData({ ...formData, severity: value as Exception['severity'] })}
            options={severityOptions}
          />
        </FormField>

        <FormField label="分配给">
          <Input
            value={formData.assignedTo}
            onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
            placeholder="请输入负责人"
          />
        </FormField>
      </div>

      <FormField label="异常描述" required error={errors.description}>
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请详细描述异常情况"
          rows={3}
        />
      </FormField>

      <FormField label="症状表现">
        <TextArea
          value={formData.symptoms}
          onChange={(value) => setFormData({ ...formData, symptoms: value })}
          placeholder="请输入症状表现，每行一个"
          rows={3}
        />
      </FormField>

      <FormField label="可能原因">
        <TextArea
          value={formData.possibleCauses}
          onChange={(value) => setFormData({ ...formData, possibleCauses: value })}
          placeholder="请输入可能原因，每行一个"
          rows={3}
        />
      </FormField>

      <FormField label="建议措施">
        <TextArea
          value={formData.recommendedActions}
          onChange={(value) => setFormData({ ...formData, recommendedActions: value })}
          placeholder="请输入建议措施，每行一个"
          rows={3}
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {exception ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function ExceptionHandling() {
  const [exceptions, setExceptions] = useState<Exception[]>(mockExceptions);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedExceptionId, setSelectedExceptionId] = useState<string | null>(null);
  
  // 模态框状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 自动刷新
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      // 模拟新异常的产生
      if (Math.random() < 0.1) { // 10% 概率产生新异常
        const newException: Exception = {
          id: `exc-${Date.now()}`,
          title: '模拟异常事件',
          description: '这是一个模拟的异常事件',
          type: 'system_error',
          severity: 'medium',
          status: 'new',
          source: {
            type: 'system',
            id: 'system',
            name: '系统监控'
          },
          affectedTargets: [],
          detectedAt: new Date().toISOString(),
          priority: Math.floor(Math.random() * 5) + 1,
          impact: {
            scope: 'single_device',
            affectedCount: 1,
            businessImpact: 'low'
          },
          symptoms: ['系统监控检测到异常'],
          possibleCauses: ['未知原因'],
          recommendedActions: ['需要进一步调查'],
          relatedExceptions: [],
          attachments: [],
          notifications: [],
          timeline: [{
            id: `tl-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: '异常检测',
            actor: '系统',
            details: '自动检测到异常事件'
          }]
        };
        
        setExceptions(prev => [newException, ...prev]);
      }
    }, 30000); // 每30秒检查一次

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // 筛选异常
  const filteredExceptions = exceptions.filter(exception => {
    const matchesSearch = exception.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exception.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || exception.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || exception.severity === severityFilter;
    const matchesStatus = statusFilter === 'all' || exception.status === statusFilter;
    
    return matchesSearch && matchesType && matchesSeverity && matchesStatus;
  });

  const selectedExceptionData = selectedExceptionId 
    ? exceptions.find(e => e.id === selectedExceptionId) 
    : null;

  // 事件处理函数
  const handleCreateException = (exceptionData: Partial<Exception>) => {
    setExceptions([exceptionData as Exception, ...exceptions]);
    setShowCreateModal(false);
  };

  const handleUpdateException = (exceptionData: Partial<Exception>) => {
    if (selectedExceptionId) {
      setExceptions(exceptions.map(e => 
        e.id === selectedExceptionId ? { ...e, ...exceptionData } : e
      ));
      setShowEditModal(false);
      setSelectedExceptionId(null);
    }
  };

  const handleDeleteException = () => {
    if (selectedExceptionId) {
      setExceptions(exceptions.filter(e => e.id !== selectedExceptionId));
      setShowDeleteModal(false);
      setSelectedExceptionId(null);
    }
  };

  const handleStatusChange = (exceptionId: string, newStatus: Exception['status']) => {
    setExceptions(exceptions.map(e => {
      if (e.id === exceptionId) {
        const updatedException = { ...e, status: newStatus };
        
        // 添加时间线记录
        const timelineEntry = {
          id: `tl-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: `状态变更为${newStatus}`,
          actor: '当前用户',
          details: `异常状态从${e.status}变更为${newStatus}`
        };
        
        updatedException.timeline = [...e.timeline, timelineEntry];
        
        if (newStatus === 'acknowledged') {
          updatedException.acknowledgedAt = new Date().toISOString();
        } else if (newStatus === 'resolved') {
          updatedException.resolvedAt = new Date().toISOString();
        }
        
        return updatedException;
      }
      return e;
    }));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return XCircle;
      case 'high': return AlertTriangle;
      case 'medium': return Clock;
      case 'low': return CheckCircle;
      default: return AlertTriangle;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600';
      case 'high': return 'text-orange-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      device_failure: '设备故障',
      sensor_error: '传感器错误',
      communication_loss: '通信中断',
      performance_degradation: '性能下降',
      safety_violation: '安全违规',
      system_error: '系统错误'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">异常处理</h1>
          <p className="text-gray-600 mt-1">监控和处理系统异常事件</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-600' : ''}
          >
            {autoRefresh ? <Bell className="h-4 w-4 mr-2" /> : <BellOff className="h-4 w-4 mr-2" />}
            {autoRefresh ? '自动监控' : '手动刷新'}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">异常总数</p>
                <p className="text-2xl font-bold">{exceptions.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">关键异常</p>
                <p className="text-2xl font-bold text-red-600">
                  {exceptions.filter(e => e.severity === 'critical').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">待处理</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {exceptions.filter(e => ['new', 'acknowledged'].includes(e.status)).length}
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
                <p className="text-sm text-gray-600">已解决</p>
                <p className="text-2xl font-bold text-green-600">
                  {exceptions.filter(e => e.status === 'resolved').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>异常列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                创建异常
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
                  placeholder="搜索异常标题或描述..."
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
                { value: 'device_failure', label: '设备故障' },
                { value: 'sensor_error', label: '传感器错误' },
                { value: 'communication_loss', label: '通信中断' },
                { value: 'performance_degradation', label: '性能下降' },
                { value: 'safety_violation', label: '安全违规' },
                { value: 'system_error', label: '系统错误' }
              ]}
            />
            <Select
              value={severityFilter}
              onChange={setSeverityFilter}
              options={[
                { value: 'all', label: '全部严重程度' },
                { value: 'critical', label: '关键' },
                { value: 'high', label: '高' },
                { value: 'medium', label: '中' },
                { value: 'low', label: '低' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'new', label: '新建' },
                { value: 'acknowledged', label: '已确认' },
                { value: 'investigating', label: '调查中' },
                { value: 'resolved', label: '已解决' },
                { value: 'closed', label: '已关闭' },
                { value: 'escalated', label: '已升级' }
              ]}
            />
          </div>

          {/* 异常表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>异常信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>严重程度</TableHead>
                <TableHead>来源</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>负责人</TableHead>
                <TableHead>检测时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExceptions.map((exception) => {
                const SeverityIcon = getSeverityIcon(exception.severity);
                return (
                  <TableRow
                    key={exception.id}
                    className={exception.status === 'new' ? 'bg-red-50' : ''}
                  >
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <SeverityIcon className={`h-5 w-5 ${getSeverityColor(exception.severity)}`} />
                        <div>
                          <div className="font-medium flex items-center">
                            {exception.title}
                            {exception.status === 'new' && (
                              <div className="w-2 h-2 bg-red-500 rounded-full ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {exception.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getTypeLabel(exception.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        exception.severity === 'critical' ? 'bg-red-100 text-red-800' :
                        exception.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                        exception.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {exception.severity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{exception.source.name}</div>
                        <div className="text-gray-500">{exception.source.type}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={exception.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {exception.assignedTo ? (
                          <>
                            <User className="h-4 w-4 mr-1 text-gray-400" />
                            {exception.assignedTo}
                          </>
                        ) : (
                          <span className="text-gray-400">未分配</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatRelativeTime(exception.detectedAt)}</div>
                        {exception.source.location && (
                          <div className="text-gray-500 flex items-center">
                            <MapPin className="h-3 w-3 mr-1" />
                            {exception.source.location.address}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedExceptionId(exception.id);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {exception.status === 'new' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(exception.id, 'acknowledged')}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}

                        {['acknowledged', 'investigating'].includes(exception.status) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleStatusChange(exception.id, 'resolved')}
                            className="text-purple-600 hover:text-purple-700"
                          >
                            <Zap className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedExceptionId(exception.id);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedExceptionId(exception.id);
                            setShowDeleteModal(true);
                          }}
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

      {/* 创建异常模态框 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建异常"
        size="lg"
      >
        <ExceptionForm
          onSubmit={handleCreateException}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* 编辑异常模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedExceptionId(null);
        }}
        title="编辑异常"
        size="lg"
      >
        <ExceptionForm
          exception={selectedExceptionData || undefined}
          onSubmit={handleUpdateException}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedExceptionId(null);
          }}
        />
      </Modal>

      {/* 异常详情模态框 */}
      {selectedExceptionData && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedExceptionId(null);
          }}
          title="异常详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="border-b pb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">{selectedExceptionData.title}</h3>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    selectedExceptionData.severity === 'critical' ? 'bg-red-100 text-red-800' :
                    selectedExceptionData.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                    selectedExceptionData.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedExceptionData.severity}
                  </span>
                  <StatusBadge status={selectedExceptionData.status} />
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                <div>来源: {selectedExceptionData.source.name}</div>
                <div>类型: {getTypeLabel(selectedExceptionData.type)}</div>
                <div>检测时间: {formatRelativeTime(selectedExceptionData.detectedAt)}</div>
              </div>
            </div>

            {/* 异常描述 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">异常描述</h4>
              <div className="p-3 bg-gray-50 rounded-lg text-sm">
                {selectedExceptionData.description}
              </div>
            </div>

            {/* 症状和原因 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">症状表现</h4>
                <ul className="space-y-1">
                  {selectedExceptionData.symptoms.map((symptom, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-red-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {symptom}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">可能原因</h4>
                <ul className="space-y-1">
                  {selectedExceptionData.possibleCauses.map((cause, index) => (
                    <li key={index} className="text-sm text-gray-600 flex items-start">
                      <span className="w-2 h-2 bg-yellow-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                      {cause}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 建议措施 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">建议措施</h4>
              <ul className="space-y-1">
                {selectedExceptionData.recommendedActions.map((action, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                    {action}
                  </li>
                ))}
              </ul>
            </div>

            {/* 处理时间线 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">处理时间线</h4>
              <div className="space-y-3">
                {selectedExceptionData.timeline.map((item, index) => (
                  <div key={item.id} className="relative">
                    {index < selectedExceptionData.timeline.length - 1 && (
                      <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    <div className="flex items-start space-x-3">
                      <div className="mt-1 w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm">{item.action}</div>
                          <div className="text-xs text-gray-500">
                            {formatRelativeTime(item.timestamp)}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.details} - {item.actor}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 解决方案 */}
            {selectedExceptionData.resolution && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">解决方案</h4>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="font-medium text-green-800 mb-2">
                    {selectedExceptionData.resolution.action}
                  </div>
                  <div className="text-sm text-green-700 mb-3">
                    {selectedExceptionData.resolution.description}
                  </div>
                  <div className="text-xs text-green-600">
                    解决者: {selectedExceptionData.resolution.resolvedBy} •
                    解决时间: {formatRelativeTime(selectedExceptionData.resolution.resolvedAt)}
                  </div>
                  {selectedExceptionData.resolution.preventiveMeasures.length > 0 && (
                    <div className="mt-3">
                      <div className="text-sm font-medium text-green-800 mb-1">预防措施:</div>
                      <ul className="space-y-1">
                        {selectedExceptionData.resolution.preventiveMeasures.map((measure, index) => (
                          <li key={index} className="text-sm text-green-700 flex items-start">
                            <span className="w-2 h-2 bg-green-400 rounded-full mt-2 mr-2 flex-shrink-0" />
                            {measure}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 附件 */}
            {selectedExceptionData.attachments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">相关附件</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {selectedExceptionData.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Activity className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <div className="font-medium text-sm">{attachment.name}</div>
                        <div className="text-xs text-gray-500">{attachment.type}</div>
                      </div>
                      <Button variant="ghost" size="sm">
                        查看
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            {selectedExceptionData.status !== 'resolved' && (
              <div className="flex space-x-2">
                {selectedExceptionData.status === 'new' && (
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedExceptionData.id, 'acknowledged');
                      setShowDetailModal(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    确认异常
                  </Button>
                )}
                {['acknowledged', 'investigating'].includes(selectedExceptionData.status) && (
                  <Button
                    onClick={() => {
                      handleStatusChange(selectedExceptionData.id, 'resolved');
                      setShowDetailModal(false);
                    }}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    标记解决
                  </Button>
                )}
              </div>
            )}
          </ModalFooter>
        </Modal>
      )}

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedExceptionId(null);
        }}
        onConfirm={handleDeleteException}
        title="删除异常"
        message={`确定要删除异常 "${selectedExceptionData?.title}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default ExceptionHandling;
