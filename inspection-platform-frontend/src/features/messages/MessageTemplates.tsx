import React, { useState } from 'react';
import {
  MessageSquare,
  FileText,
  Edit,
  Trash2,
  Eye,
  Copy,
  Plus,
  Search,
  Filter,
  Save,
  Settings,
  RefreshCw,
  Tag,
  Clock,
  Users,
  Bell,
  Mail,
  Smartphone
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 消息模板类型定义
interface MessageTemplate {
  id: string;
  name: string;
  description: string;
  category: 'alert' | 'notification' | 'reminder' | 'report' | 'maintenance' | 'emergency';
  type: 'email' | 'sms' | 'push' | 'webhook' | 'multi';
  status: 'active' | 'inactive' | 'draft';
  priority: 'low' | 'medium' | 'high' | 'critical';
  template: {
    subject: string;
    content: string;
    variables: string[];
    format: 'text' | 'html' | 'markdown';
  };
  triggers: {
    events: string[];
    conditions: {
      field: string;
      operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
      value: string | number;
    }[];
    schedule?: {
      enabled: boolean;
      frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
      time?: string;
    };
  };
  recipients: {
    type: 'role' | 'user' | 'group' | 'dynamic';
    targets: string[];
    dynamicRule?: string;
  };
  settings: {
    retryAttempts: number;
    retryInterval: number;
    expirationTime?: number;
    requireConfirmation: boolean;
    trackDelivery: boolean;
  };
  usage: {
    sentCount: number;
    successRate: number;
    lastUsed?: string;
    avgDeliveryTime: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Mock数据
const mockTemplates: MessageTemplate[] = [
  {
    id: 'template-1',
    name: '设备异常警报模板',
    description: '当设备检测到异常时自动发送的警报消息',
    category: 'alert',
    type: 'multi',
    status: 'active',
    priority: 'critical',
    template: {
      subject: '【紧急】设备异常警报 - {{device_name}}',
      content: `设备 {{device_name}} 检测到异常情况：

异常类型：{{exception_type}}
异常描述：{{exception_description}}
检测时间：{{detection_time}}
影响程度：{{impact_level}}

建议措施：
{{recommended_actions}}

请立即处理此异常情况。

系统自动发送，请勿回复。`,
      variables: ['device_name', 'exception_type', 'exception_description', 'detection_time', 'impact_level', 'recommended_actions'],
      format: 'text'
    },
    triggers: {
      events: ['device_exception', 'sensor_anomaly'],
      conditions: [
        {
          field: 'severity',
          operator: 'equals',
          value: 'critical'
        }
      ],
      schedule: {
        enabled: true,
        frequency: 'immediate'
      }
    },
    recipients: {
      type: 'role',
      targets: ['engineer', 'supervisor'],
      dynamicRule: 'device_responsible_person'
    },
    settings: {
      retryAttempts: 3,
      retryInterval: 5,
      expirationTime: 24,
      requireConfirmation: true,
      trackDelivery: true
    },
    usage: {
      sentCount: 156,
      successRate: 98.7,
      lastUsed: '2024-07-17T10:30:00Z',
      avgDeliveryTime: 2.3
    },
    createdAt: '2024-06-01T09:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z',
    createdBy: '张工程师'
  },
  {
    id: 'template-2',
    name: '巡检任务提醒模板',
    description: '巡检任务开始前的提醒消息',
    category: 'reminder',
    type: 'push',
    status: 'active',
    priority: 'medium',
    template: {
      subject: '巡检任务提醒 - {{task_name}}',
      content: `您有一个巡检任务即将开始：

任务名称：{{task_name}}
开始时间：{{start_time}}
预计时长：{{duration}}分钟
巡检目标：{{target_list}}
负责设备：{{device_name}}

请提前做好准备。`,
      variables: ['task_name', 'start_time', 'duration', 'target_list', 'device_name'],
      format: 'text'
    },
    triggers: {
      events: ['task_scheduled'],
      conditions: [],
      schedule: {
        enabled: true,
        frequency: 'daily',
        time: '08:30'
      }
    },
    recipients: {
      type: 'user',
      targets: ['assigned_operator']
    },
    settings: {
      retryAttempts: 2,
      retryInterval: 10,
      requireConfirmation: false,
      trackDelivery: true
    },
    usage: {
      sentCount: 89,
      successRate: 95.5,
      lastUsed: '2024-07-17T08:30:00Z',
      avgDeliveryTime: 1.8
    },
    createdAt: '2024-06-15T10:00:00Z',
    updatedAt: '2024-07-10T16:20:00Z',
    createdBy: '李技术员'
  },
  {
    id: 'template-3',
    name: '维护报告模板',
    description: '设备维护完成后的报告消息',
    category: 'report',
    type: 'email',
    status: 'active',
    priority: 'low',
    template: {
      subject: '设备维护报告 - {{device_name}}',
      content: `设备维护已完成：

设备名称：{{device_name}}
维护类型：{{maintenance_type}}
维护时间：{{maintenance_date}}
维护人员：{{technician_name}}
维护内容：{{maintenance_details}}

维护结果：{{maintenance_result}}
下次维护：{{next_maintenance}}

详细报告请查看附件。`,
      variables: ['device_name', 'maintenance_type', 'maintenance_date', 'technician_name', 'maintenance_details', 'maintenance_result', 'next_maintenance'],
      format: 'html'
    },
    triggers: {
      events: ['maintenance_completed'],
      conditions: [],
      schedule: {
        enabled: false,
        frequency: 'immediate'
      }
    },
    recipients: {
      type: 'group',
      targets: ['maintenance_team', 'management']
    },
    settings: {
      retryAttempts: 1,
      retryInterval: 30,
      requireConfirmation: false,
      trackDelivery: true
    },
    usage: {
      sentCount: 34,
      successRate: 100,
      lastUsed: '2024-07-16T15:45:00Z',
      avgDeliveryTime: 5.2
    },
    createdAt: '2024-07-01T11:00:00Z',
    updatedAt: '2024-07-16T15:45:00Z',
    createdBy: '王维护员'
  }
];

// 模板表单组件
interface TemplateFormProps {
  template?: MessageTemplate;
  onSubmit: (template: Partial<MessageTemplate>) => void;
  onCancel: () => void;
}

function TemplateForm({ template, onSubmit, onCancel }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'notification',
    type: template?.type || 'email',
    priority: template?.priority || 'medium',
    subject: template?.template?.subject || '',
    content: template?.template?.content || '',
    format: template?.template?.format || 'text',
    retryAttempts: template?.settings?.retryAttempts || 2,
    retryInterval: template?.settings?.retryInterval || 5
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = [
    { value: 'alert', label: '警报' },
    { value: 'notification', label: '通知' },
    { value: 'reminder', label: '提醒' },
    { value: 'report', label: '报告' },
    { value: 'maintenance', label: '维护' },
    { value: 'emergency', label: '紧急' }
  ];

  const typeOptions = [
    { value: 'email', label: '邮件' },
    { value: 'sms', label: '短信' },
    { value: 'push', label: '推送' },
    { value: 'webhook', label: 'Webhook' },
    { value: 'multi', label: '多渠道' }
  ];

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '关键' }
  ];

  const formatOptions = [
    { value: 'text', label: '纯文本' },
    { value: 'html', label: 'HTML' },
    { value: 'markdown', label: 'Markdown' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '模板名称不能为空';
    }
    if (!formData.subject.trim()) {
      newErrors.subject = '消息主题不能为空';
    }
    if (!formData.content.trim()) {
      newErrors.content = '消息内容不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // 提取模板变量
    const variables = Array.from(
      new Set([
        ...formData.subject.match(/\{\{(\w+)\}\}/g)?.map(v => v.slice(2, -2)) || [],
        ...formData.content.match(/\{\{(\w+)\}\}/g)?.map(v => v.slice(2, -2)) || []
      ])
    );

    const templateData: Partial<MessageTemplate> = {
      ...formData,
      template: {
        subject: formData.subject,
        content: formData.content,
        variables,
        format: formData.format as any
      },
      triggers: template?.triggers || {
        events: [],
        conditions: [],
        schedule: {
          enabled: false,
          frequency: 'immediate'
        }
      },
      recipients: template?.recipients || {
        type: 'role',
        targets: []
      },
      settings: {
        retryAttempts: formData.retryAttempts,
        retryInterval: formData.retryInterval,
        requireConfirmation: false,
        trackDelivery: true
      },
      usage: template?.usage || {
        sentCount: 0,
        successRate: 0,
        avgDeliveryTime: 0
      },
      status: 'draft',
      createdBy: template?.createdBy || '当前用户',
      createdAt: template?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (template) {
      templateData.id = template.id;
    } else {
      templateData.id = `template-${Date.now()}`;
    }

    onSubmit(templateData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="模板名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入模板名称"
          />
        </FormField>

        <FormField label="消息类型">
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as MessageTemplate['type'] })}
            options={typeOptions}
          />
        </FormField>

        <FormField label="消息分类">
          <Select
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as MessageTemplate['category'] })}
            options={categoryOptions}
          />
        </FormField>

        <FormField label="优先级">
          <Select
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value as MessageTemplate['priority'] })}
            options={priorityOptions}
          />
        </FormField>

        <FormField label="内容格式">
          <Select
            value={formData.format}
            onChange={(value) => setFormData({ ...formData, format: value })}
            options={formatOptions}
          />
        </FormField>

        <FormField label="重试次数">
          <Input
            type="number"
            min="0"
            max="10"
            value={formData.retryAttempts}
            onChange={(e) => setFormData({ ...formData, retryAttempts: parseInt(e.target.value) || 0 })}
          />
        </FormField>
      </div>

      <FormField label="模板描述">
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请描述模板的用途和使用场景"
          rows={2}
        />
      </FormField>

      <FormField label="消息主题" required error={errors.subject}>
        <Input
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          placeholder="支持变量，如：{{device_name}}"
        />
      </FormField>

      <FormField label="消息内容" required error={errors.content}>
        <TextArea
          value={formData.content}
          onChange={(value) => setFormData({ ...formData, content: value })}
          placeholder="支持变量，如：{{device_name}}、{{exception_type}} 等"
          rows={8}
        />
      </FormField>

      <div className="bg-blue-50 p-3 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">变量说明</h4>
        <p className="text-xs text-blue-600">
          使用 {`{{variable_name}}`} 格式插入变量。常用变量：device_name（设备名称）、exception_type（异常类型）、
          detection_time（检测时间）、task_name（任务名称）等。
        </p>
      </div>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {template ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function MessageTemplates() {
  const [templates, setTemplates] = useState<MessageTemplate[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  
  // 模态框状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 筛选模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || template.category === categoryFilter;
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // 事件处理函数
  const handleCreateTemplate = (templateData: Partial<MessageTemplate>) => {
    setTemplates([templateData as MessageTemplate, ...templates]);
    setShowCreateModal(false);
  };

  const handleUpdateTemplate = (templateData: Partial<MessageTemplate>) => {
    if (selectedTemplate?.id) {
      setTemplates(templates.map(t => 
        t.id === selectedTemplate.id ? { ...t, ...templateData } : t
      ));
      setShowEditModal(false);
      setSelectedTemplate(null);
    }
  };

  const handleToggleStatus = (templateId: string) => {
    setTemplates(templates.map(t => 
      t.id === templateId 
        ? { ...t, status: t.status === 'active' ? 'inactive' : 'active' }
        : t
    ));
  };

  const handleDuplicateTemplate = (template: MessageTemplate) => {
    const duplicatedTemplate: MessageTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (副本)`,
      status: 'draft',
      usage: {
        sentCount: 0,
        successRate: 0,
        avgDeliveryTime: 0
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: '当前用户'
    };
    setTemplates([duplicatedTemplate, ...templates]);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'alert': return Bell;
      case 'notification': return MessageSquare;
      case 'reminder': return Clock;
      case 'report': return Template;
      case 'maintenance': return Settings;
      case 'emergency': return Bell;
      default: return MessageSquare;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'email': return Mail;
      case 'sms': return Smartphone;
      case 'push': return Bell;
      case 'webhook': return Settings;
      case 'multi': return Users;
      default: return MessageSquare;
    }
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      alert: '警报',
      notification: '通知',
      reminder: '提醒',
      report: '报告',
      maintenance: '维护',
      emergency: '紧急'
    };
    return categoryMap[category] || category;
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      email: '邮件',
      sms: '短信',
      push: '推送',
      webhook: 'Webhook',
      multi: '多渠道'
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
        <h1 className="text-3xl font-bold text-gray-900">消息模板</h1>
        <p className="text-gray-600 mt-1">管理和配置消息通知模板</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">模板总数</p>
                <p className="text-2xl font-bold">{templates.length}</p>
              </div>
              <Template className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃模板</p>
                <p className="text-2xl font-bold text-green-600">
                  {templates.filter(t => t.status === 'active').length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总发送量</p>
                <p className="text-2xl font-bold text-purple-600">
                  {templates.reduce((sum, t) => sum + t.usage.sentCount, 0)}
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均成功率</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(templates.reduce((sum, t) => sum + t.usage.successRate, 0) / templates.length).toFixed(1)}%
                </p>
              </div>
              <Bell className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>消息模板列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                刷新
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                全局设置
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建模板
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
                  placeholder="搜索模板名称或描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={[
                { value: 'all', label: '全部分类' },
                { value: 'alert', label: '警报' },
                { value: 'notification', label: '通知' },
                { value: 'reminder', label: '提醒' },
                { value: 'report', label: '报告' },
                { value: 'maintenance', label: '维护' },
                { value: 'emergency', label: '紧急' }
              ]}
            />
            <Select
              value={typeFilter}
              onChange={setTypeFilter}
              options={[
                { value: 'all', label: '全部类型' },
                { value: 'email', label: '邮件' },
                { value: 'sms', label: '短信' },
                { value: 'push', label: '推送' },
                { value: 'webhook', label: 'Webhook' },
                { value: 'multi', label: '多渠道' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: '活跃' },
                { value: 'inactive', label: '停用' },
                { value: 'draft', label: '草稿' }
              ]}
            />
          </div>

          {/* 模板表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模板信息</TableHead>
                <TableHead>分类</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>使用统计</TableHead>
                <TableHead>最后更新</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => {
                const CategoryIcon = getCategoryIcon(template.category);
                const TypeIcon = getTypeIcon(template.type);
                return (
                  <TableRow key={template.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <CategoryIcon className={`h-5 w-5 ${
                          template.status === 'active' ? 'text-green-500' :
                          template.status === 'inactive' ? 'text-gray-400' :
                          'text-yellow-500'
                        }`} />
                        <div>
                          <div className="font-medium">{template.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {template.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getCategoryLabel(template.category)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <TypeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm">{getTypeLabel(template.type)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(template.priority)}`}>
                        {template.priority}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={template.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="font-medium">{template.usage.sentCount} 次</div>
                        <div className="text-gray-500">
                          成功率: {template.usage.successRate}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatRelativeTime(template.updatedAt)}</div>
                        <div className="text-gray-500">by {template.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateTemplate(template)}
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(template.id)}
                          className={template.status === 'active' ? 'text-yellow-600 hover:text-yellow-700' : 'text-green-600 hover:text-green-700'}
                        >
                          {template.status === 'active' ? '停用' : '启用'}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template);
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

      {/* 创建模板模态框 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建消息模板"
        size="lg"
      >
        <TemplateForm
          onSubmit={handleCreateTemplate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* 编辑模板模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTemplate(null);
        }}
        title="编辑消息模板"
        size="lg"
      >
        <TemplateForm
          template={selectedTemplate || undefined}
          onSubmit={handleUpdateTemplate}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedTemplate(null);
          }}
        />
      </Modal>

      {/* 模板详情模态框 */}
      {selectedTemplate && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedTemplate(null);
          }}
          title="模板详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">模板名称:</span> {selectedTemplate.name}</div>
                  <div><span className="text-gray-500">分类:</span> {getCategoryLabel(selectedTemplate.category)}</div>
                  <div><span className="text-gray-500">类型:</span> {getTypeLabel(selectedTemplate.type)}</div>
                  <div><span className="text-gray-500">优先级:</span> {selectedTemplate.priority}</div>
                  <div><span className="text-gray-500">状态:</span> {selectedTemplate.status}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">设置信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">重试次数:</span> {selectedTemplate.settings.retryAttempts}</div>
                  <div><span className="text-gray-500">重试间隔:</span> {selectedTemplate.settings.retryInterval}分钟</div>
                  <div><span className="text-gray-500">需要确认:</span> {selectedTemplate.settings.requireConfirmation ? '是' : '否'}</div>
                  <div><span className="text-gray-500">跟踪投递:</span> {selectedTemplate.settings.trackDelivery ? '是' : '否'}</div>
                </div>
              </div>
            </div>

            {/* 模板内容 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">模板内容</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700">主题:</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded border text-sm">
                    {selectedTemplate.template.subject}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">内容:</label>
                  <div className="mt-1 p-3 bg-gray-50 rounded border text-sm whitespace-pre-wrap">
                    {selectedTemplate.template.content}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">格式:</label>
                  <span className="ml-2 text-sm">{selectedTemplate.template.format}</span>
                </div>
              </div>
            </div>

            {/* 变量列表 */}
            {selectedTemplate.template.variables.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">模板变量</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.template.variables.map((variable, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                      {`{{${variable}}}`}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* 触发条件 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">触发条件</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">触发事件:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTemplate.triggers.events.map((event, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                        {event}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedTemplate.triggers.conditions.length > 0 && (
                  <div>
                    <span className="text-gray-500">条件:</span>
                    <div className="mt-1">
                      {selectedTemplate.triggers.conditions.map((condition, index) => (
                        <div key={index} className="text-xs bg-yellow-50 p-2 rounded mb-1">
                          {condition.field} {condition.operator} {condition.value}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedTemplate.triggers.schedule && (
                  <div>
                    <span className="text-gray-500">调度:</span>
                    <div className="mt-1 text-xs">
                      {selectedTemplate.triggers.schedule.enabled ? (
                        `${selectedTemplate.triggers.schedule.frequency} ${selectedTemplate.triggers.schedule.time || ''}`
                      ) : (
                        '未启用'
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 接收人配置 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">接收人配置</h4>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-500">类型:</span> {selectedTemplate.recipients.type}</div>
                <div>
                  <span className="text-gray-500">目标:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedTemplate.recipients.targets.map((target, index) => (
                      <span key={index} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                        {target}
                      </span>
                    ))}
                  </div>
                </div>
                {selectedTemplate.recipients.dynamicRule && (
                  <div><span className="text-gray-500">动态规则:</span> {selectedTemplate.recipients.dynamicRule}</div>
                )}
              </div>
            </div>

            {/* 使用统计 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">使用统计</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-blue-600 font-medium">发送次数</div>
                  <div className="text-2xl font-bold text-blue-800">{selectedTemplate.usage.sentCount}</div>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-green-600 font-medium">成功率</div>
                  <div className="text-2xl font-bold text-green-800">{selectedTemplate.usage.successRate}%</div>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-purple-600 font-medium">平均投递时间</div>
                  <div className="text-2xl font-bold text-purple-800">{selectedTemplate.usage.avgDeliveryTime}s</div>
                </div>
                <div className="p-3 bg-yellow-50 rounded-lg">
                  <div className="text-yellow-600 font-medium">最后使用</div>
                  <div className="text-sm font-bold text-yellow-800">
                    {selectedTemplate.usage.lastUsed ? formatRelativeTime(selectedTemplate.usage.lastUsed) : '未使用'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => handleDuplicateTemplate(selectedTemplate)}>
                <Copy className="h-4 w-4 mr-2" />
                复制
              </Button>
              <Button onClick={() => {
                setShowDetailModal(false);
                setShowEditModal(true);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default MessageTemplates;
