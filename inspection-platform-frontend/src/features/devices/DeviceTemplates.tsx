import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Copy,
  Settings,
  FileText,
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

// 设备模板类型定义
interface DeviceTemplate {
  id: string;
  name: string;
  type: 'drone' | 'camera' | 'robot' | 'sensor';
  description: string;
  capabilities: string[];
  specifications: {
    [key: string]: string | number;
  };
  protocols: string[];
  status: 'active' | 'inactive' | 'draft';
  createdAt: string;
  updatedAt: string;
  usageCount: number;
}

// Mock数据
const mockTemplates: DeviceTemplate[] = [
  {
    id: 'template-1',
    name: '标准无人机模板',
    type: 'drone',
    description: '适用于常规巡检的无人机设备模板',
    capabilities: ['飞行控制', '图像采集', '视频录制', 'GPS定位'],
    specifications: {
      '最大飞行高度': '500m',
      '续航时间': '30分钟',
      '载重': '2kg',
      '摄像头分辨率': '4K'
    },
    protocols: ['MQTT', 'HTTP', 'WebSocket'],
    status: 'active',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-10T14:30:00Z',
    usageCount: 15
  },
  {
    id: 'template-2',
    name: '高清摄像头模板',
    type: 'camera',
    description: '用于固定点位监控的高清摄像头模板',
    capabilities: ['图像采集', '夜视功能', '运动检测', '云台控制'],
    specifications: {
      '分辨率': '1080P',
      '视角': '120°',
      '夜视距离': '50m',
      '存储容量': '128GB'
    },
    protocols: ['RTSP', 'HTTP', 'ONVIF'],
    status: 'active',
    createdAt: '2024-02-20T09:15:00Z',
    updatedAt: '2024-07-08T11:20:00Z',
    usageCount: 8
  },
  {
    id: 'template-3',
    name: '巡检机器人模板',
    type: 'robot',
    description: '地面巡检机器人设备模板',
    capabilities: ['自主导航', '障碍物检测', '环境监测', '语音交互'],
    specifications: {
      '移动速度': '1.5m/s',
      '续航时间': '8小时',
      '载重': '10kg',
      '防护等级': 'IP65'
    },
    protocols: ['ROS', 'MQTT', 'HTTP'],
    status: 'active',
    createdAt: '2024-03-10T16:45:00Z',
    updatedAt: '2024-07-12T09:10:00Z',
    usageCount: 12
  },
  {
    id: 'template-4',
    name: '环境传感器模板',
    type: 'sensor',
    description: '多功能环境监测传感器模板',
    capabilities: ['温度检测', '湿度检测', '气体检测', '噪音监测'],
    specifications: {
      '温度范围': '-40°C ~ 85°C',
      '湿度范围': '0% ~ 100%',
      '精度': '±0.5°C',
      '供电方式': '太阳能+电池'
    },
    protocols: ['LoRaWAN', 'MQTT', 'HTTP'],
    status: 'draft',
    createdAt: '2024-06-01T13:20:00Z',
    updatedAt: '2024-07-15T15:45:00Z',
    usageCount: 0
  },
  {
    id: 'template-5',
    name: '测温云台模板',
    type: 'camera',
    description: '集成热成像与可见光的测温云台设备模板，可用于设备热点监测',
    capabilities: ['图像采集', '热成像测温', '云台控制'],
    specifications: {
      '测温范围': '-20°C ~ 550°C',
      '测温精度': '±2°C',
      '最大测温距离': '300m',
      '云台速度': '20°/s'
    },
    protocols: ['RTSP', 'HTTP', 'ONVIF'],
    status: 'active',
    createdAt: '2024-07-01T10:00:00Z',
    updatedAt: '2024-07-16T09:00:00Z',
    usageCount: 6
  },
  {
    id: 'template-6',
    name: '可见光云台模板',
    type: 'camera',
    description: '用于远距离可见光监控的云台设备模板',
    capabilities: ['图像采集', '云台控制', '远距离变焦'],
    specifications: {
      '分辨率': '4K',
      '光学变倍': '30x',
      '最大观测距离': '800m',
      '水平旋转范围': '360°'
    },
    protocols: ['RTSP', 'HTTP', 'ONVIF'],
    status: 'active',
    createdAt: '2024-07-01T10:05:00Z',
    updatedAt: '2024-07-16T09:05:00Z',
    usageCount: 4
  },
  {
    id: 'template-7',
    name: '漏油检测云台模板',
    type: 'camera',
    description: '基于红外与可见光的漏油检测专用云台模板',
    capabilities: ['图像采集', '红外成像', '漏油检测', '云台控制'],
    specifications: {
      '检测波段': '3.3–3.6μm',
      '最小检出率': '0.5L/h',
      '最大检测距离': '300m'
    },
    protocols: ['RTSP', 'HTTP'],
    status: 'active',
    createdAt: '2024-07-01T10:10:00Z',
    updatedAt: '2024-07-16T09:10:00Z',
    usageCount: 3
  },
  {
    id: 'template-8',
    name: '在线式声像仪模板',
    type: 'sensor',
    description: '用于局放、泄漏等声学异常定位的在线声像仪模板',
    capabilities: ['声像成像', '温度检测', '异常告警'],
    specifications: {
      '频率范围': '2kHz ~ 48kHz',
      '动态范围': '120dB',
      '麦克风阵列数量': '64'
    },
    protocols: ['MQTT', 'HTTP'],
    status: 'active',
    createdAt: '2024-07-01T10:15:00Z',
    updatedAt: '2024-07-16T09:15:00Z',
    usageCount: 2
  },
  {
    id: 'template-9',
    name: '双镜头云台+声像仪一体云台模板',
    type: 'camera',
    description: '集可见光、热成像与声像定位于一体的综合云台设备模板',
    capabilities: ['图像采集', '热成像测温', '声像成像', '云台控制'],
    specifications: {
      '可见光分辨率': '4K',
      '热成像分辨率': '640x512',
      '声像阵列': '64通道',
      '最大观测距离': '600m'
    },
    protocols: ['RTSP', 'HTTP', 'MQTT'],
    status: 'active',
    createdAt: '2024-07-01T10:20:00Z',
    updatedAt: '2024-07-16T09:20:00Z',
    usageCount: 1
  },
  {
    id: 'template-10',
    name: 'TDLAS检测云台模板',
    type: 'sensor',
    description: '基于TDLAS技术的远距离气体泄漏检测云台模板',
    capabilities: ['气体检测', 'TDLAS测量', '云台控制'],
    specifications: {
      '可检测气体': 'CH4 / C2H6',
      '检测距离': '500m',
      '最小检出浓度': '5ppm·m'
    },
    protocols: ['MQTT', 'HTTP'],
    status: 'active',
    createdAt: '2024-07-01T10:25:00Z',
    updatedAt: '2024-07-16T09:25:00Z',
    usageCount: 2
  },
  {
    id: 'template-11',
    name: '边缘分析主机模板',
    type: 'sensor',
    description: '用于边缘侧AI推理与数据汇聚的分析主机模板',
    capabilities: ['边缘计算', 'AI推理', '数据汇聚'],
    specifications: {
      'CPU核心数': '8',
      '内存': '32GB',
      '存储空间': '512GB SSD',
      '网络接口': '2 x 10GbE'
    },
    protocols: ['MQTT', 'HTTP', 'gRPC'],
    status: 'active',
    createdAt: '2024-07-01T10:30:00Z',
    updatedAt: '2024-07-16T09:30:00Z',
    usageCount: 5
  }
];

// 模板表单组件
interface TemplateFormProps {
  template?: DeviceTemplate;
  onSubmit: (template: Partial<DeviceTemplate>) => void;
  onCancel: () => void;
}

function TemplateForm({ template, onSubmit, onCancel }: TemplateFormProps) {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    type: template?.type || 'drone',
    description: template?.description || '',
    capabilities: template?.capabilities?.join(', ') || '',
    protocols: template?.protocols?.join(', ') || '',
    status: template?.status || 'draft',
    specifications: template?.specifications || {}
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const deviceTypes = [
    { value: 'drone', label: '无人机' },
    { value: 'camera', label: '摄像头' },
    { value: 'robot', label: '机器人' },
    { value: 'sensor', label: '传感器' }
  ];

  const statusOptions = [
    { value: 'active', label: '启用' },
    { value: 'inactive', label: '禁用' },
    { value: 'draft', label: '草稿' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '模板名称不能为空';
    }
    if (!formData.description.trim()) {
      newErrors.description = '模板描述不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const templateData: Partial<DeviceTemplate> = {
      ...formData,
      capabilities: formData.capabilities.split(',').map(c => c.trim()).filter(Boolean),
      protocols: formData.protocols.split(',').map(p => p.trim()).filter(Boolean),
      updatedAt: new Date().toISOString(),
    };

    if (template) {
      templateData.id = template.id;
    } else {
      templateData.id = `template-${Date.now()}`;
      templateData.createdAt = new Date().toISOString();
      templateData.usageCount = 0;
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

        <FormField label="设备类型" required>
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as DeviceTemplate['type'] })}
            options={deviceTypes}
          />
        </FormField>

        <FormField label="状态">
          <Select
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as DeviceTemplate['status'] })}
            options={statusOptions}
          />
        </FormField>

        <FormField label="支持协议">
          <Input
            value={formData.protocols}
            onChange={(e) => setFormData({ ...formData, protocols: e.target.value })}
            placeholder="请输入支持的协议，用逗号分隔"
          />
        </FormField>
      </div>

      <FormField label="模板描述" required error={errors.description}>
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请输入模板描述"
          rows={3}
        />
      </FormField>

      <FormField label="设备能力">
        <TextArea
          value={formData.capabilities}
          onChange={(value) => setFormData({ ...formData, capabilities: value })}
          placeholder="请输入设备能力，用逗号分隔"
          rows={3}
        />
      </FormField>

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

function DeviceTemplates() {
  const [templates, setTemplates] = useState<DeviceTemplate[]>(mockTemplates);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<DeviceTemplate | null>(null);

  // 筛选模板
  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || template.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || template.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // 事件处理函数
  const handleAddTemplate = (templateData: Partial<DeviceTemplate>) => {
    setTemplates([...templates, templateData as DeviceTemplate]);
    setShowAddModal(false);
  };

  const handleUpdateTemplate = (templateData: Partial<DeviceTemplate>) => {
    if (selectedTemplate?.id) {
      setTemplates(templates.map(t =>
        t.id === selectedTemplate.id ? { ...t, ...templateData } : t
      ));
      setShowEditModal(false);
      setSelectedTemplate(null);
    }
  };

  const handleDeleteTemplate = () => {
    if (selectedTemplate?.id) {
      setTemplates(templates.filter(t => t.id !== selectedTemplate.id));
      setShowDeleteModal(false);
      setSelectedTemplate(null);
    }
  };

  const handleCopyTemplate = (template: DeviceTemplate) => {
    const newTemplate: DeviceTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (副本)`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      usageCount: 0
    };
    setTemplates([...templates, newTemplate]);
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      drone: '无人机',
      camera: '摄像头',
      robot: '机器人',
      sensor: '传感器'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">设备模板</h1>
        <p className="text-gray-600 mt-1">管理设备模板，为设备创建提供标准化配置</p>
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
              <FileText className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">启用模板</p>
                <p className="text-2xl font-bold text-green-600">
                  {templates.filter(t => t.status === 'active').length}
                </p>
              </div>
              <Zap className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">草稿模板</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {templates.filter(t => t.status === 'draft').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">总使用次数</p>
                <p className="text-2xl font-bold text-purple-600">
                  {templates.reduce((sum, t) => sum + t.usageCount, 0)}
                </p>
              </div>
              <Copy className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>模板列表</CardTitle>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              创建模板
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
                  placeholder="搜索模板名称或描述..."
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
                { value: 'drone', label: '无人机' },
                { value: 'camera', label: '摄像头' },
                { value: 'robot', label: '机器人' },
                { value: 'sensor', label: '传感器' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: '启用' },
                { value: 'inactive', label: '禁用' },
                { value: 'draft', label: '草稿' }
              ]}
            />
          </div>

          {/* 模板表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>模板名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>使用次数</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">{template.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {getTypeLabel(template.type)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={template.status} />
                  </TableCell>
                  <TableCell>{template.usageCount}</TableCell>
                  <TableCell>{formatRelativeTime(template.updatedAt)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopyTemplate(template)}
                      >
                        <Copy className="h-4 w-4" />
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
                        onClick={() => {
                          setSelectedTemplate(template);
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

      {/* 添加模板模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="创建设备模板"
        size="lg"
      >
        <TemplateForm
          onSubmit={handleAddTemplate}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 编辑模板模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTemplate(null);
        }}
        title="编辑设备模板"
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

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTemplate(null);
        }}
        onConfirm={handleDeleteTemplate}
        title="删除模板"
        message={`确定要删除模板 "${selectedTemplate?.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default DeviceTemplates;
