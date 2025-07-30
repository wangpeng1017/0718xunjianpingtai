import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  GitBranch,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Layers,
  Network,
  ArrowRight,
  ArrowDown,
  Zap,
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

// 依赖关系类型定义
interface DependencyRelation {
  id: string;
  name: string;
  sourceId: string;
  sourceName: string;
  sourceType: 'device' | 'capability' | 'service' | 'platform';
  targetId: string;
  targetName: string;
  targetType: 'device' | 'capability' | 'service' | 'platform';
  dependencyType: 'required' | 'optional' | 'conditional' | 'exclusive';
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  description: string;
  conditions?: {
    [key: string]: any;
  };
  conflicts: string[];
  lastChecked: string;
  createdAt: string;
  updatedAt: string;
}

// 依赖冲突类型定义
interface DependencyConflict {
  id: string;
  type: 'circular' | 'version' | 'resource' | 'exclusive';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  affectedDependencies: string[];
  suggestedSolution: string;
  status: 'detected' | 'resolving' | 'resolved' | 'ignored';
  detectedAt: string;
}

// Mock数据
const mockDependencies: DependencyRelation[] = [
  {
    id: 'dep-1',
    name: '视频采集依赖存储服务',
    sourceId: 'cap-video-capture',
    sourceName: '视频采集能力',
    sourceType: 'capability',
    targetId: 'service-storage',
    targetName: '存储服务',
    targetType: 'service',
    dependencyType: 'required',
    status: 'healthy',
    description: '视频采集功能需要存储服务来保存视频文件',
    conditions: {
      'min_storage_space': '100GB',
      'write_speed': '50MB/s'
    },
    conflicts: [],
    lastChecked: '2024-07-17T09:00:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z'
  },
  {
    id: 'dep-2',
    name: 'AI分析依赖GPU服务',
    sourceId: 'cap-ai-analysis',
    sourceName: 'AI分析能力',
    sourceType: 'capability',
    targetId: 'service-gpu',
    targetName: 'GPU计算服务',
    targetType: 'service',
    dependencyType: 'required',
    status: 'warning',
    description: 'AI分析需要GPU计算资源',
    conditions: {
      'gpu_memory': '8GB',
      'cuda_version': '11.0+'
    },
    conflicts: ['dep-3'],
    lastChecked: '2024-07-17T08:30:00Z',
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-07-10T16:20:00Z'
  },
  {
    id: 'dep-3',
    name: '机器人导航依赖定位服务',
    sourceId: 'device-robot-01',
    sourceName: '巡检机器人-01',
    sourceType: 'device',
    targetId: 'service-positioning',
    targetName: '定位服务',
    targetType: 'service',
    dependencyType: 'required',
    status: 'healthy',
    description: '机器人导航需要精确的定位服务',
    conditions: {
      'accuracy': '10cm',
      'update_rate': '10Hz'
    },
    conflicts: [],
    lastChecked: '2024-07-17T07:45:00Z',
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-07-14T11:45:00Z'
  },
  {
    id: 'dep-4',
    name: '温度监控依赖报警系统',
    sourceId: 'cap-temp-monitor',
    sourceName: '温度监控能力',
    sourceType: 'capability',
    targetId: 'service-alarm',
    targetName: '报警系统',
    targetType: 'service',
    dependencyType: 'conditional',
    status: 'error',
    description: '温度异常时需要触发报警',
    conditions: {
      'threshold_temp': '80°C',
      'response_time': '5s'
    },
    conflicts: [],
    lastChecked: '2024-07-17T06:00:00Z',
    createdAt: '2024-04-05T14:00:00Z',
    updatedAt: '2024-07-12T09:30:00Z'
  }
];

const mockConflicts: DependencyConflict[] = [
  {
    id: 'conflict-1',
    type: 'resource',
    severity: 'medium',
    description: 'GPU资源竞争：AI分析和视频处理同时需要GPU资源',
    affectedDependencies: ['dep-2', 'dep-5'],
    suggestedSolution: '配置GPU资源调度策略或增加GPU资源',
    status: 'detected',
    detectedAt: '2024-07-17T08:00:00Z'
  },
  {
    id: 'conflict-2',
    type: 'version',
    severity: 'high',
    description: '版本冲突：定位服务v2.0与机器人固件v1.5不兼容',
    affectedDependencies: ['dep-3'],
    suggestedSolution: '升级机器人固件到v2.0或降级定位服务到v1.8',
    status: 'resolving',
    detectedAt: '2024-07-16T15:30:00Z'
  }
];

// 依赖表单组件
interface DependencyFormProps {
  dependency?: DependencyRelation;
  onSubmit: (dependency: Partial<DependencyRelation>) => void;
  onCancel: () => void;
}

function DependencyForm({ dependency, onSubmit, onCancel }: DependencyFormProps) {
  const [formData, setFormData] = useState({
    name: dependency?.name || '',
    sourceId: dependency?.sourceId || '',
    sourceName: dependency?.sourceName || '',
    sourceType: dependency?.sourceType || 'device',
    targetId: dependency?.targetId || '',
    targetName: dependency?.targetName || '',
    targetType: dependency?.targetType || 'service',
    dependencyType: dependency?.dependencyType || 'required',
    description: dependency?.description || '',
    conflicts: dependency?.conflicts?.join(', ') || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const entityTypes = [
    { value: 'device', label: '设备' },
    { value: 'capability', label: '能力' },
    { value: 'service', label: '服务' },
    { value: 'platform', label: '平台' }
  ];

  const dependencyTypes = [
    { value: 'required', label: '必需' },
    { value: 'optional', label: '可选' },
    { value: 'conditional', label: '条件' },
    { value: 'exclusive', label: '排斥' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '依赖名称不能为空';
    }
    if (!formData.sourceName.trim()) {
      newErrors.sourceName = '源实体名称不能为空';
    }
    if (!formData.targetName.trim()) {
      newErrors.targetName = '目标实体名称不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const dependencyData: Partial<DependencyRelation> = {
      ...formData,
      sourceId: formData.sourceId || `${formData.sourceType}-${Date.now()}`,
      targetId: formData.targetId || `${formData.targetType}-${Date.now()}`,
      conflicts: formData.conflicts.split(',').map(c => c.trim()).filter(Boolean),
      conditions: dependency?.conditions || {},
      status: dependency?.status || 'unknown',
      lastChecked: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (dependency) {
      dependencyData.id = dependency.id;
    } else {
      dependencyData.id = `dep-${Date.now()}`;
      dependencyData.createdAt = new Date().toISOString();
    }

    onSubmit(dependencyData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormField label="依赖名称" required error={errors.name}>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="请输入依赖关系名称"
        />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">源实体</h4>
          <FormField label="源实体名称" required error={errors.sourceName}>
            <Input
              value={formData.sourceName}
              onChange={(e) => setFormData({ ...formData, sourceName: e.target.value })}
              placeholder="请输入源实体名称"
            />
          </FormField>
          <FormField label="源实体类型">
            <Select
              value={formData.sourceType}
              onChange={(value) => setFormData({ ...formData, sourceType: value as DependencyRelation['sourceType'] })}
              options={entityTypes}
            />
          </FormField>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-900">目标实体</h4>
          <FormField label="目标实体名称" required error={errors.targetName}>
            <Input
              value={formData.targetName}
              onChange={(e) => setFormData({ ...formData, targetName: e.target.value })}
              placeholder="请输入目标实体名称"
            />
          </FormField>
          <FormField label="目标实体类型">
            <Select
              value={formData.targetType}
              onChange={(value) => setFormData({ ...formData, targetType: value as DependencyRelation['targetType'] })}
              options={entityTypes}
            />
          </FormField>
        </div>
      </div>

      <FormField label="依赖类型">
        <Select
          value={formData.dependencyType}
          onChange={(value) => setFormData({ ...formData, dependencyType: value as DependencyRelation['dependencyType'] })}
          options={dependencyTypes}
        />
      </FormField>

      <FormField label="依赖描述">
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请输入依赖关系描述"
          rows={3}
        />
      </FormField>

      <FormField label="冲突依赖">
        <Input
          value={formData.conflicts}
          onChange={(e) => setFormData({ ...formData, conflicts: e.target.value })}
          placeholder="请输入冲突的依赖ID，用逗号分隔"
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {dependency ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function IntegrationDependencies() {
  const [dependencies, setDependencies] = useState<DependencyRelation[]>(mockDependencies);
  const [conflicts, setConflicts] = useState<DependencyConflict[]>(mockConflicts);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'dependencies' | 'conflicts' | 'visualization'>('dependencies');
  
  // 模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDependency, setSelectedDependency] = useState<DependencyRelation | null>(null);

  // 筛选依赖
  const filteredDependencies = dependencies.filter(dep => {
    const matchesSearch = dep.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dep.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dep.targetName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || dep.dependencyType === typeFilter;
    const matchesStatus = statusFilter === 'all' || dep.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // 事件处理函数
  const handleAddDependency = (depData: Partial<DependencyRelation>) => {
    setDependencies([...dependencies, depData as DependencyRelation]);
    setShowAddModal(false);
  };

  const handleUpdateDependency = (depData: Partial<DependencyRelation>) => {
    if (selectedDependency?.id) {
      setDependencies(dependencies.map(d => 
        d.id === selectedDependency.id ? { ...d, ...depData } : d
      ));
      setShowEditModal(false);
      setSelectedDependency(null);
    }
  };

  const handleDeleteDependency = () => {
    if (selectedDependency?.id) {
      setDependencies(dependencies.filter(d => d.id !== selectedDependency.id));
      setShowDeleteModal(false);
      setSelectedDependency(null);
    }
  };

  const handleCheckDependency = (dependency: DependencyRelation) => {
    // 模拟检查依赖状态
    setDependencies(dependencies.map(d => 
      d.id === dependency.id 
        ? { ...d, lastChecked: new Date().toISOString(), status: Math.random() > 0.3 ? 'healthy' : 'warning' }
        : d
    ));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return CheckCircle;
      case 'warning': return AlertTriangle;
      case 'error': return XCircle;
      default: return Eye;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'required': return Zap;
      case 'optional': return Settings;
      case 'conditional': return GitBranch;
      case 'exclusive': return XCircle;
      default: return Network;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      required: '必需',
      optional: '可选',
      conditional: '条件',
      exclusive: '排斥'
    };
    return typeMap[type] || type;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">集成依赖</h1>
        <p className="text-gray-600 mt-1">管理设备间依赖关系和冲突检测</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">依赖总数</p>
                <p className="text-2xl font-bold">{dependencies.length}</p>
              </div>
              <GitBranch className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">健康依赖</p>
                <p className="text-2xl font-bold text-green-600">
                  {dependencies.filter(d => d.status === 'healthy').length}
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
                <p className="text-sm text-gray-600">警告依赖</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {dependencies.filter(d => d.status === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">冲突数量</p>
                <p className="text-2xl font-bold text-red-600">
                  {conflicts.filter(c => c.status === 'detected').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 标签页导航 */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('dependencies')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'dependencies'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            依赖关系
          </button>
          <button
            onClick={() => setActiveTab('conflicts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'conflicts'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            冲突检测
          </button>
          <button
            onClick={() => setActiveTab('visualization')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'visualization'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            依赖图谱
          </button>
        </nav>
      </div>

      {/* 依赖关系标签页 */}
      {activeTab === 'dependencies' && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>依赖关系列表</CardTitle>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加依赖
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
                    placeholder="搜索依赖名称或实体..."
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
                  { value: 'required', label: '必需' },
                  { value: 'optional', label: '可选' },
                  { value: 'conditional', label: '条件' },
                  { value: 'exclusive', label: '排斥' }
                ]}
              />
              <Select
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: 'all', label: '全部状态' },
                  { value: 'healthy', label: '健康' },
                  { value: 'warning', label: '警告' },
                  { value: 'error', label: '错误' },
                  { value: 'unknown', label: '未知' }
                ]}
              />
            </div>

            {/* 依赖表格 */}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>依赖关系</TableHead>
                  <TableHead>源实体</TableHead>
                  <TableHead>目标实体</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>最后检查</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDependencies.map((dependency) => {
                  const StatusIcon = getStatusIcon(dependency.status);
                  const TypeIcon = getTypeIcon(dependency.dependencyType);
                  return (
                    <TableRow key={dependency.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{dependency.name}</div>
                          <div className="text-sm text-gray-500">{dependency.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{dependency.sourceName}</div>
                          <div className="text-gray-500">{dependency.sourceType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{dependency.targetName}</div>
                          <div className="text-gray-500">{dependency.targetType}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <TypeIcon className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{getTypeLabel(dependency.dependencyType)}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <StatusIcon className={`h-4 w-4 ${
                            dependency.status === 'healthy' ? 'text-green-500' :
                            dependency.status === 'warning' ? 'text-yellow-500' :
                            dependency.status === 'error' ? 'text-red-500' :
                            'text-gray-400'
                          }`} />
                          <StatusBadge status={dependency.status} />
                        </div>
                      </TableCell>
                      <TableCell>{formatRelativeTime(dependency.lastChecked)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleCheckDependency(dependency)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDependency(dependency);
                              setShowEditModal(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedDependency(dependency);
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

      {/* 冲突检测标签页 */}
      {activeTab === 'conflicts' && (
        <Card>
          <CardHeader>
            <CardTitle>依赖冲突检测</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>冲突类型</TableHead>
                  <TableHead>严重程度</TableHead>
                  <TableHead>描述</TableHead>
                  <TableHead>影响依赖</TableHead>
                  <TableHead>建议解决方案</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>检测时间</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {conflicts.map((conflict) => (
                  <TableRow key={conflict.id}>
                    <TableCell>
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        {conflict.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(conflict.severity)}`}>
                        {conflict.severity}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{conflict.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {conflict.affectedDependencies.length} 个依赖
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-gray-600">{conflict.suggestedSolution}</div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={conflict.status} />
                    </TableCell>
                    <TableCell>{formatRelativeTime(conflict.detectedAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* 依赖图谱标签页 */}
      {activeTab === 'visualization' && (
        <Card>
          <CardHeader>
            <CardTitle>依赖关系图谱</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">依赖关系可视化图谱功能开发中...</p>
              <p className="text-sm text-gray-400 mt-2">将显示设备、能力、服务之间的依赖关系网络图</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 添加依赖模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加依赖关系"
        size="lg"
      >
        <DependencyForm
          onSubmit={handleAddDependency}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 编辑依赖模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDependency(null);
        }}
        title="编辑依赖关系"
        size="lg"
      >
        <DependencyForm
          dependency={selectedDependency || undefined}
          onSubmit={handleUpdateDependency}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedDependency(null);
          }}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDependency(null);
        }}
        onConfirm={handleDeleteDependency}
        title="删除依赖"
        message={`确定要删除依赖关系 "${selectedDependency?.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default IntegrationDependencies;
