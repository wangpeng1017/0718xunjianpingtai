import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  MapPin,
  Layers,
  Eye,
  Settings,
  Navigation,
  Target,
  Map,
  Ruler,
  Grid,
  Move,
  RotateCcw,
  Save
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 巡检目标类型定义
interface InspectionTarget {
  id: string;
  name: string;
  type: 'equipment' | 'area' | 'point' | 'route' | 'zone';
  category: 'electrical' | 'mechanical' | 'structural' | 'environmental' | 'safety';
  description: string;
  location: {
    lat: number;
    lng: number;
    altitude?: number;
    address?: string;
  };
  geometry: {
    type: 'point' | 'polygon' | 'line' | 'circle';
    coordinates: number[][];
    radius?: number; // 用于圆形区域
  };
  hierarchy: {
    parentId?: string;
    level: number;
    path: string;
  };
  properties: {
    priority: 'low' | 'medium' | 'high' | 'critical';
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
    duration: number; // 预计巡检时间（分钟）
    requirements: string[];
    hazards: string[];
  };
  status: 'active' | 'inactive' | 'maintenance' | 'decommissioned';
  metadata: {
    tags: string[];
    attributes: { [key: string]: any };
    images: string[];
    documents: string[];
  };
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastInspected?: string;
  inspectionCount: number;
}

// Mock数据
const mockTargets: InspectionTarget[] = [
  {
    id: 'target-1',
    name: '主变压器A1',
    type: 'equipment',
    category: 'electrical',
    description: '110kV主变压器，负责区域供电',
    location: {
      lat: 39.9042,
      lng: 116.4074,
      altitude: 15,
      address: '北京市朝阳区电力大厦A区'
    },
    geometry: {
      type: 'point',
      coordinates: [[116.4074, 39.9042]]
    },
    hierarchy: {
      parentId: 'zone-electrical',
      level: 2,
      path: '/电力设备/变压器区域/主变压器A1'
    },
    properties: {
      priority: 'critical',
      frequency: 'daily',
      duration: 30,
      requirements: ['红外热成像', '声音检测', '油位检查'],
      hazards: ['高压电', '高温', '噪音']
    },
    status: 'active',
    metadata: {
      tags: ['变压器', '高压', '关键设备'],
      attributes: {
        voltage: '110kV',
        capacity: '50MVA',
        manufacturer: 'ABB',
        installDate: '2020-03-15'
      },
      images: ['transformer_a1_1.jpg', 'transformer_a1_2.jpg'],
      documents: ['manual_a1.pdf', 'maintenance_log_a1.xlsx']
    },
    createdBy: '张工程师',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z',
    lastInspected: '2024-07-17T09:00:00Z',
    inspectionCount: 156
  },
  {
    id: 'target-2',
    name: '冷却塔区域',
    type: 'area',
    category: 'mechanical',
    description: '冷却塔及周边设备区域',
    location: {
      lat: 39.9052,
      lng: 116.4084,
      address: '北京市朝阳区电力大厦B区'
    },
    geometry: {
      type: 'polygon',
      coordinates: [
        [116.4080, 39.9050],
        [116.4088, 39.9050],
        [116.4088, 39.9054],
        [116.4080, 39.9054],
        [116.4080, 39.9050]
      ]
    },
    hierarchy: {
      parentId: 'zone-mechanical',
      level: 2,
      path: '/机械设备/冷却系统/冷却塔区域'
    },
    properties: {
      priority: 'high',
      frequency: 'weekly',
      duration: 45,
      requirements: ['振动检测', '温度监控', '水质检测'],
      hazards: ['旋转设备', '湿滑地面', '化学品']
    },
    status: 'active',
    metadata: {
      tags: ['冷却塔', '水循环', '机械设备'],
      attributes: {
        capacity: '1000m³/h',
        towers: 3,
        pumpCount: 6
      },
      images: ['cooling_tower_1.jpg'],
      documents: ['cooling_system_manual.pdf']
    },
    createdBy: '李技术员',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-07-10T16:20:00Z',
    lastInspected: '2024-07-15T14:00:00Z',
    inspectionCount: 24
  },
  {
    id: 'target-3',
    name: '巡检路径-东区',
    type: 'route',
    category: 'safety',
    description: '东区设备巡检标准路径',
    location: {
      lat: 39.9062,
      lng: 116.4094,
      address: '北京市朝阳区电力大厦东区'
    },
    geometry: {
      type: 'line',
      coordinates: [
        [116.4090, 39.9060],
        [116.4095, 39.9062],
        [116.4098, 39.9064],
        [116.4100, 39.9066],
        [116.4095, 39.9068]
      ]
    },
    hierarchy: {
      level: 1,
      path: '/巡检路径/东区路径'
    },
    properties: {
      priority: 'medium',
      frequency: 'daily',
      duration: 60,
      requirements: ['路径畅通检查', '安全标识检查', '照明检查'],
      hazards: ['交通', '障碍物', '照明不足']
    },
    status: 'active',
    metadata: {
      tags: ['巡检路径', '安全', '东区'],
      attributes: {
        length: '500m',
        checkpoints: 8,
        estimatedTime: '60min'
      },
      images: ['route_east_1.jpg'],
      documents: ['route_safety_guide.pdf']
    },
    createdBy: '王维护员',
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-07-14T11:45:00Z',
    lastInspected: '2024-07-17T08:00:00Z',
    inspectionCount: 89
  }
];

// 目标表单组件
interface TargetFormProps {
  target?: InspectionTarget;
  onSubmit: (target: Partial<InspectionTarget>) => void;
  onCancel: () => void;
}

function TargetForm({ target, onSubmit, onCancel }: TargetFormProps) {
  const [formData, setFormData] = useState({
    name: target?.name || '',
    type: target?.type || 'equipment',
    category: target?.category || 'electrical',
    description: target?.description || '',
    lat: target?.location?.lat || 39.9042,
    lng: target?.location?.lng || 116.4074,
    altitude: target?.location?.altitude || 0,
    address: target?.location?.address || '',
    priority: target?.properties?.priority || 'medium',
    frequency: target?.properties?.frequency || 'weekly',
    duration: target?.properties?.duration || 30,
    requirements: target?.properties?.requirements?.join(', ') || '',
    hazards: target?.properties?.hazards?.join(', ') || '',
    tags: target?.metadata?.tags?.join(', ') || '',
    parentId: target?.hierarchy?.parentId || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const targetTypes = [
    { value: 'equipment', label: '设备' },
    { value: 'area', label: '区域' },
    { value: 'point', label: '点位' },
    { value: 'route', label: '路径' },
    { value: 'zone', label: '区域' }
  ];

  const categoryOptions = [
    { value: 'electrical', label: '电气设备' },
    { value: 'mechanical', label: '机械设备' },
    { value: 'structural', label: '结构设施' },
    { value: 'environmental', label: '环境设备' },
    { value: 'safety', label: '安全设施' }
  ];

  const priorityOptions = [
    { value: 'low', label: '低' },
    { value: 'medium', label: '中' },
    { value: 'high', label: '高' },
    { value: 'critical', label: '关键' }
  ];

  const frequencyOptions = [
    { value: 'daily', label: '每日' },
    { value: 'weekly', label: '每周' },
    { value: 'monthly', label: '每月' },
    { value: 'quarterly', label: '每季度' },
    { value: 'yearly', label: '每年' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '目标名称不能为空';
    }
    if (!formData.lat || !formData.lng) {
      newErrors.location = '位置坐标不能为空';
    }
    if (formData.duration <= 0) {
      newErrors.duration = '预计时长必须大于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const targetData: Partial<InspectionTarget> = {
      ...formData,
      location: {
        lat: formData.lat,
        lng: formData.lng,
        altitude: formData.altitude,
        address: formData.address
      },
      geometry: target?.geometry || {
        type: 'point',
        coordinates: [[formData.lng, formData.lat]]
      },
      hierarchy: {
        parentId: formData.parentId || undefined,
        level: target?.hierarchy?.level || 1,
        path: target?.hierarchy?.path || `/${formData.name}`
      },
      properties: {
        priority: formData.priority as InspectionTarget['properties']['priority'],
        frequency: formData.frequency as InspectionTarget['properties']['frequency'],
        duration: formData.duration,
        requirements: formData.requirements.split(',').map(r => r.trim()).filter(Boolean),
        hazards: formData.hazards.split(',').map(h => h.trim()).filter(Boolean)
      },
      metadata: {
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        attributes: target?.metadata?.attributes || {},
        images: target?.metadata?.images || [],
        documents: target?.metadata?.documents || []
      },
      status: target?.status || 'active',
      createdBy: target?.createdBy || '当前用户',
      inspectionCount: target?.inspectionCount || 0,
      updatedAt: new Date().toISOString()
    };

    if (target) {
      targetData.id = target.id;
    } else {
      targetData.id = `target-${Date.now()}`;
      targetData.createdAt = new Date().toISOString();
    }

    onSubmit(targetData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="目标名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入巡检目标名称"
          />
        </FormField>

        <FormField label="目标类型">
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as InspectionTarget['type'] })}
            options={targetTypes}
          />
        </FormField>

        <FormField label="设备分类">
          <Select
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as InspectionTarget['category'] })}
            options={categoryOptions}
          />
        </FormField>

        <FormField label="优先级">
          <Select
            value={formData.priority}
            onChange={(value) => setFormData({ ...formData, priority: value })}
            options={priorityOptions}
          />
        </FormField>

        <FormField label="巡检频率">
          <Select
            value={formData.frequency}
            onChange={(value) => setFormData({ ...formData, frequency: value })}
            options={frequencyOptions}
          />
        </FormField>

        <FormField label="预计时长(分钟)" required error={errors.duration}>
          <Input
            type="number"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
            placeholder="请输入预计巡检时长"
          />
        </FormField>

        <FormField label="纬度" required error={errors.location}>
          <Input
            type="number"
            step="0.000001"
            value={formData.lat}
            onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) || 0 })}
            placeholder="请输入纬度"
          />
        </FormField>

        <FormField label="经度" required error={errors.location}>
          <Input
            type="number"
            step="0.000001"
            value={formData.lng}
            onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) || 0 })}
            placeholder="请输入经度"
          />
        </FormField>

        <FormField label="海拔(米)">
          <Input
            type="number"
            value={formData.altitude}
            onChange={(e) => setFormData({ ...formData, altitude: parseInt(e.target.value) || 0 })}
            placeholder="请输入海拔高度"
          />
        </FormField>
      </div>

      <FormField label="地址">
        <Input
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="请输入详细地址"
        />
      </FormField>

      <FormField label="目标描述">
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请输入巡检目标描述"
          rows={3}
        />
      </FormField>

      <FormField label="巡检要求">
        <Input
          value={formData.requirements}
          onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
          placeholder="请输入巡检要求，用逗号分隔"
        />
      </FormField>

      <FormField label="安全隐患">
        <Input
          value={formData.hazards}
          onChange={(e) => setFormData({ ...formData, hazards: e.target.value })}
          placeholder="请输入安全隐患，用逗号分隔"
        />
      </FormField>

      <FormField label="标签">
        <Input
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="请输入标签，用逗号分隔"
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {target ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function InspectionTargets() {
  const [targets, setTargets] = useState<InspectionTarget[]>(mockTargets);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'list' | 'map' | 'hierarchy'>('list');
  
  // 模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<InspectionTarget | null>(null);

  // 筛选目标
  const filteredTargets = targets.filter(target => {
    const matchesSearch = target.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         target.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || target.type === typeFilter;
    const matchesCategory = categoryFilter === 'all' || target.category === categoryFilter;
    
    return matchesSearch && matchesType && matchesCategory;
  });

  // 事件处理函数
  const handleAddTarget = (targetData: Partial<InspectionTarget>) => {
    setTargets([...targets, targetData as InspectionTarget]);
    setShowAddModal(false);
  };

  const handleUpdateTarget = (targetData: Partial<InspectionTarget>) => {
    if (selectedTarget?.id) {
      setTargets(targets.map(t => 
        t.id === selectedTarget.id ? { ...t, ...targetData } : t
      ));
      setShowEditModal(false);
      setSelectedTarget(null);
    }
  };

  const handleDeleteTarget = () => {
    if (selectedTarget?.id) {
      setTargets(targets.filter(t => t.id !== selectedTarget.id));
      setShowDeleteModal(false);
      setSelectedTarget(null);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'equipment': return Settings;
      case 'area': return Grid;
      case 'point': return MapPin;
      case 'route': return Navigation;
      case 'zone': return Layers;
      default: return Target;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      equipment: '设备',
      area: '区域',
      point: '点位',
      route: '路径',
      zone: '区域'
    };
    return typeMap[type] || type;
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, string> = {
      electrical: '电气设备',
      mechanical: '机械设备',
      structural: '结构设施',
      environmental: '环境设备',
      safety: '安全设施'
    };
    return categoryMap[category] || category;
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
        <h1 className="text-3xl font-bold text-gray-900">巡检目标</h1>
        <p className="text-gray-600 mt-1">管理巡检目标的空间位置和层级关系</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">目标总数</p>
                <p className="text-2xl font-bold">{targets.length}</p>
              </div>
              <Target className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">关键目标</p>
                <p className="text-2xl font-bold text-red-600">
                  {targets.filter(t => t.properties.priority === 'critical').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃目标</p>
                <p className="text-2xl font-bold text-green-600">
                  {targets.filter(t => t.status === 'active').length}
                </p>
              </div>
              <MapPin className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">巡检次数</p>
                <p className="text-2xl font-bold text-purple-600">
                  {targets.reduce((sum, t) => sum + t.inspectionCount, 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('list')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'list'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            目标列表
          </button>
          <button
            onClick={() => setActiveTab('map')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'map'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            地图视图
          </button>
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'hierarchy'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            层级结构
          </button>
        </nav>
      </div>

      {/* 目标列表标签页 */}
      {activeTab === 'list' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>巡检目标列表</CardTitle>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加目标
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
                    placeholder="搜索目标名称或描述..."
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
                  { value: 'equipment', label: '设备' },
                  { value: 'area', label: '区域' },
                  { value: 'point', label: '点位' },
                  { value: 'route', label: '路径' },
                  { value: 'zone', label: '区域' }
                ]}
              />
              <Select
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[
                  { value: 'all', label: '全部分类' },
                  { value: 'electrical', label: '电气设备' },
                  { value: 'mechanical', label: '机械设备' },
                  { value: 'structural', label: '结构设施' },
                  { value: 'environmental', label: '环境设备' },
                  { value: 'safety', label: '安全设施' }
                ]}
              />
            </div>

            {/* 目标表格 */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>目标名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>分类</TableHead>
                  <TableHead>位置</TableHead>
                  <TableHead>优先级</TableHead>
                  <TableHead>巡检频率</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>巡检次数</TableHead>
                  <TableHead>最后巡检</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTargets.map((target) => {
                  const TypeIcon = getTypeIcon(target.type);
                  return (
                    <TableRow key={target.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <TypeIcon className="h-5 w-5 text-gray-400" />
                          <div>
                            <div className="font-medium">{target.name}</div>
                            <div className="text-sm text-gray-500">{target.description}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {getTypeLabel(target.type)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          {getCategoryLabel(target.category)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{target.location.lat.toFixed(4)}, {target.location.lng.toFixed(4)}</div>
                          <div className="text-gray-500">{target.location.address}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(target.properties.priority)}`}>
                          {target.properties.priority}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{target.properties.frequency}</div>
                          <div className="text-gray-500">{target.properties.duration}分钟</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={target.status} />
                      </TableCell>
                      <TableCell>{target.inspectionCount}</TableCell>
                      <TableCell>
                        {target.lastInspected ? formatRelativeTime(target.lastInspected) : '未巡检'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTarget(target);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTarget(target);
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
      )}

      {/* 地图视图标签页 */}
      {activeTab === 'map' && (
        <Card>
          <CardHeader>
            <CardTitle>地图视图</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Map className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">地图视图功能开发中...</p>
              <p className="text-sm text-gray-400 mt-2">将显示巡检目标在地图上的空间分布</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 层级结构标签页 */}
      {activeTab === 'hierarchy' && (
        <Card>
          <CardHeader>
            <CardTitle>层级结构</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Layers className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">层级结构视图功能开发中...</p>
              <p className="text-sm text-gray-400 mt-2">将显示巡检目标的树形层级关系</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 添加目标模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加巡检目标"
        size="lg"
      >
        <TargetForm
          onSubmit={handleAddTarget}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 编辑目标模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTarget(null);
        }}
        title="编辑巡检目标"
        size="lg"
      >
        <TargetForm
          target={selectedTarget || undefined}
          onSubmit={handleUpdateTarget}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedTarget(null);
          }}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedTarget(null);
        }}
        onConfirm={handleDeleteTarget}
        title="删除目标"
        message={`确定要删除巡检目标 "${selectedTarget?.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default InspectionTargets;
