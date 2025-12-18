import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Settings,
  Eye,
  Database,
  Camera,
  Mic,
  Navigation,
  Cpu
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';

// 设备能力类型定义
interface DeviceCapability {
  id: string;
  name: string;
  type: 'data_collection' | 'video_processing' | 'control' | 'communication' | 'analysis' | 'navigation';
  category: 'video' | 'image' | 'data';
  description: string;
  deviceId: string;
  deviceName: string;
  status: 'active' | 'inactive' | 'testing' | 'error';
  dataTypes: string[];
  interfaces: {
    input: string[];
    output: string[];
  };
  createdAt: string;
  updatedAt: string;
}

// Mock数据
const mockCapabilities: DeviceCapability[] = [
  {
    id: 'cap-1',
    name: '高清视频采集',
    type: 'data_collection',
    category: 'video',
    description: '支持4K高清视频实时采集和传输',
    deviceId: 'device-1',
    deviceName: '巡检机器狗-01',
    status: 'active',
    dataTypes: ['video/mp4', 'image/jpeg'],
    interfaces: {
      input: ['camera_sensor'],
      output: ['video_stream', 'image_capture']
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z',
  },
  {
    id: 'cap-2',
    name: '红外热成像',
    type: 'data_collection',
    category: 'data',
    description: '红外热成像数据采集和温度分析',
    deviceId: 'device-1',
    deviceName: '巡检机器狗-01',
    status: 'active',
    dataTypes: ['thermal/raw', 'temperature/celsius'],
    interfaces: {
      input: ['thermal_sensor'],
      output: ['thermal_image', 'temperature_data']
    },
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-07-10T16:20:00Z',
  },
  {
    id: 'cap-3',
    name: '智能路径规划',
    type: 'navigation',
    category: 'data',
    description: '基于AI的智能路径规划和避障',
    deviceId: 'device-2',
    deviceName: '巡检机器人-02',
    status: 'testing',
    dataTypes: ['path/waypoints', 'obstacle/detection'],
    interfaces: {
      input: ['gps_data', 'lidar_data', 'target_coordinates'],
      output: ['navigation_path', 'movement_commands']
    },
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-07-14T11:45:00Z',
  }
];

// 能力表单组件
interface CapabilityFormProps {
  capability?: DeviceCapability;
  onSubmit: (capability: Partial<DeviceCapability>) => void;
  onCancel: () => void;
}

function CapabilityForm({ capability, onSubmit, onCancel }: CapabilityFormProps) {
  const [formData, setFormData] = useState({
    name: capability?.name || '',
    type: capability?.type || 'data_collection',
    category: capability?.category || 'video',
    description: capability?.description || '',
    deviceId: capability?.deviceId || '',
    status: capability?.status || 'inactive',
    dataTypes: capability?.dataTypes?.join(', ') || '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock设备数据
  const devices = [
    { value: 'device-1', label: '巡检机器狗-01' },
    { value: 'device-2', label: '巡检机器人-02' },
    { value: 'device-3', label: '安防机器人-03' },
    { value: 'device-4', label: '环境传感器-04' }
  ];

  const capabilityTypes = [
    { value: 'data_collection', label: '数据采集' },
    { value: 'video_processing', label: '视频处理' },
    { value: 'control', label: '设备控制' },
    { value: 'communication', label: '通信交互' },
    { value: 'analysis', label: '数据分析' },
    { value: 'navigation', label: '导航定位' }
  ];

  const categoryOptions = [
    { value: 'video', label: '视频回传' },
    { value: 'image', label: '图像回传' },
    { value: 'data', label: '数据回传' }
  ];

  const statusOptions = [
    { value: 'active', label: '启用' },
    { value: 'inactive', label: '禁用' },
    { value: 'testing', label: '测试中' },
    { value: 'error', label: '错误' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '能力名称不能为空';
    }
    if (!formData.deviceId) {
      newErrors.deviceId = '请选择关联设备';
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

    const capabilityData: Partial<DeviceCapability> = {
      ...formData,
      deviceName: selectedDevice?.label || '',
      dataTypes: formData.dataTypes.split(',').map(t => t.trim()).filter(Boolean),
      interfaces: capability?.interfaces || { input: [], output: [] },
      updatedAt: new Date().toISOString()
    };

    if (capability) {
      capabilityData.id = capability.id;
    } else {
      capabilityData.id = `cap-${Date.now()}`;
      capabilityData.createdAt = new Date().toISOString();
    }

    onSubmit(capabilityData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="能力名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入能力名称"
          />
        </FormField>

        <FormField label="关联设备" required error={errors.deviceId}>
          <Select
            value={formData.deviceId}
            onChange={(value) => setFormData({ ...formData, deviceId: value })}
            options={devices}
            placeholder="请选择关联设备"
          />
        </FormField>

        <FormField label="能力类型">
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as DeviceCapability['type'] })}
            options={capabilityTypes}
          />
        </FormField>

        <FormField label="能力分类">
          <Select
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as DeviceCapability['category'] })}
            options={categoryOptions}
          />
        </FormField>

        <FormField label="状态">
          <Select
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as DeviceCapability['status'] })}
            options={statusOptions}
          />
        </FormField>

        <FormField label="数据类型">
          <Input
            value={formData.dataTypes}
            onChange={(e) => setFormData({ ...formData, dataTypes: e.target.value })}
            placeholder="请输入数据类型，用逗号分隔"
          />
        </FormField>
      </div>

      <FormField label="能力描述">
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请输入能力描述"
          rows={2}
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {capability ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function DeviceCapabilities() {
  const [capabilities, setCapabilities] = useState<DeviceCapability[]>(mockCapabilities);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // 模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCapability, setSelectedCapability] = useState<DeviceCapability | null>(null);

  // 筛选能力
  const filteredCapabilities = capabilities.filter(capability => {
    const matchesSearch = capability.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      capability.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || capability.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || capability.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  // 事件处理函数
  const handleAddCapability = (capabilityData: Partial<DeviceCapability>) => {
    setCapabilities([...capabilities, capabilityData as DeviceCapability]);
    setShowAddModal(false);
  };

  const handleUpdateCapability = (capabilityData: Partial<DeviceCapability>) => {
    if (selectedCapability?.id) {
      setCapabilities(capabilities.map(c =>
        c.id === selectedCapability.id ? { ...c, ...capabilityData } : c
      ));
      setShowEditModal(false);
      setSelectedCapability(null);
    }
  };

  const handleDeleteCapability = () => {
    if (selectedCapability?.id) {
      setCapabilities(capabilities.filter(c => c.id !== selectedCapability.id));
      setShowDeleteModal(false);
      setSelectedCapability(null);
    }
  };

  const handleTestCapability = (_capability: DeviceCapability) => {
    // 功能已移除
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'data_collection': return Camera;
      case 'video_processing': return Eye;
      case 'control': return Settings;
      case 'communication': return Mic;
      case 'analysis': return Cpu;
      case 'navigation': return Navigation;
      default: return Database;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      data_collection: '数据采集',
      video_processing: '视频处理',
      control: '设备控制',
      communication: '通信交互',
      analysis: '数据分析',
      navigation: '导航定位'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">设备能力</h1>
        <p className="text-gray-600 mt-1">管理设备能力配置和性能监控</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">能力总数</p>
                <p className="text-2xl font-bold">{capabilities.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃能力</p>
                <p className="text-2xl font-bold text-green-600">
                  {capabilities.filter(c => c.status === 'active').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>设备能力列表</CardTitle>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加能力
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
                  placeholder="搜索能力名称或描述..."
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
                { value: 'data_collection', label: '数据采集' },
                { value: 'video_processing', label: '视频处理' },
                { value: 'control', label: '设备控制' },
                { value: 'communication', label: '通信交互' },
                { value: 'analysis', label: '数据分析' },
                { value: 'navigation', label: '导航定位' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: '启用' },
                { value: 'inactive', label: '禁用' },
                { value: 'testing', label: '测试中' },
                { value: 'error', label: '错误' }
              ]}
            />
          </div>

          {/* 能力表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>设备</TableHead>
                <TableHead>能力名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCapabilities.map((capability) => {
                const TypeIcon = getTypeIcon(capability.type);
                return (
                  <TableRow key={capability.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{capability.deviceName}</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <TypeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{capability.name}</div>
                          <div className="text-sm text-gray-500">{capability.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getTypeLabel(capability.type)}
                      </span>
                      <div className="mt-1">
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full text-[10px]">
                          {capability.category === 'video' ? '视频回传' :
                            capability.category === 'image' ? '图像回传' :
                              capability.category === 'data' ? '数据回传' : capability.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={capability.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCapability(capability);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCapability(capability);
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

      {/* 添加能力模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加设备能力"
        size="lg"
      >
        <CapabilityForm
          onSubmit={handleAddCapability}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 编辑能力模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCapability(null);
        }}
        title="编辑设备能力"
        size="lg"
      >
        <CapabilityForm
          capability={selectedCapability || undefined}
          onSubmit={handleUpdateCapability}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedCapability(null);
          }}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedCapability(null);
        }}
        onConfirm={handleDeleteCapability}
        title="删除能力"
        message={`确定要删除能力 "${selectedCapability?.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default DeviceCapabilities;
