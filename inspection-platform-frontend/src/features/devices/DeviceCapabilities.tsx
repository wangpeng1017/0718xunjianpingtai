import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Settings,
  Play,
  Pause,
  Upload,
  Download,
  Eye,
  Cpu,
  Database,
  Wifi,
  Camera,
  Mic,
  Navigation,
  Thermometer
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 设备能力类型定义
interface DeviceCapability {
  id: string;
  name: string;
  type: 'data_collection' | 'video_processing' | 'control' | 'communication' | 'analysis' | 'navigation';
  category: 'input' | 'output' | 'processing' | 'storage';
  description: string;
  deviceId: string;
  deviceName: string;
  status: 'active' | 'inactive' | 'testing' | 'error';
  dataTypes: string[];
  parameters: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'array' | 'object';
      value: any;
      required: boolean;
      description: string;
    };
  };
  interfaces: {
    input: string[];
    output: string[];
  };
  dependencies: string[];
  performance: {
    latency: number; // ms
    throughput: number; // ops/sec
    accuracy: number; // percentage
  };
  createdAt: string;
  updatedAt: string;
  lastTested: string;
  testResults: {
    success: number;
    failed: number;
    lastResult: 'success' | 'failed' | 'pending';
  };
}

// Mock数据
const mockCapabilities: DeviceCapability[] = [
  {
    id: 'cap-1',
    name: '高清视频采集',
    type: 'data_collection',
    category: 'input',
    description: '支持4K高清视频实时采集和传输',
    deviceId: 'device-1',
    deviceName: '巡检无人机-01',
    status: 'active',
    dataTypes: ['video/mp4', 'image/jpeg'],
    parameters: {
      resolution: {
        type: 'string',
        value: '3840x2160',
        required: true,
        description: '视频分辨率'
      },
      frameRate: {
        type: 'number',
        value: 30,
        required: true,
        description: '帧率(fps)'
      },
      bitRate: {
        type: 'number',
        value: 8000,
        required: false,
        description: '码率(kbps)'
      }
    },
    interfaces: {
      input: ['camera_sensor'],
      output: ['video_stream', 'image_capture']
    },
    dependencies: ['power_management', 'storage_management'],
    performance: {
      latency: 50,
      throughput: 30,
      accuracy: 98.5
    },
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z',
    lastTested: '2024-07-17T09:00:00Z',
    testResults: {
      success: 245,
      failed: 5,
      lastResult: 'success'
    }
  },
  {
    id: 'cap-2',
    name: '红外热成像',
    type: 'data_collection',
    category: 'input',
    description: '红外热成像数据采集和温度分析',
    deviceId: 'device-1',
    deviceName: '巡检无人机-01',
    status: 'active',
    dataTypes: ['thermal/raw', 'temperature/celsius'],
    parameters: {
      temperatureRange: {
        type: 'string',
        value: '-20°C to 150°C',
        required: true,
        description: '温度检测范围'
      },
      sensitivity: {
        type: 'number',
        value: 0.1,
        required: true,
        description: '温度敏感度(°C)'
      }
    },
    interfaces: {
      input: ['thermal_sensor'],
      output: ['thermal_image', 'temperature_data']
    },
    dependencies: ['calibration_service'],
    performance: {
      latency: 100,
      throughput: 10,
      accuracy: 95.2
    },
    createdAt: '2024-02-01T08:00:00Z',
    updatedAt: '2024-07-10T16:20:00Z',
    lastTested: '2024-07-16T15:30:00Z',
    testResults: {
      success: 189,
      failed: 11,
      lastResult: 'success'
    }
  },
  {
    id: 'cap-3',
    name: '智能路径规划',
    type: 'navigation',
    category: 'processing',
    description: '基于AI的智能路径规划和避障',
    deviceId: 'device-2',
    deviceName: '巡检机器人-02',
    status: 'testing',
    dataTypes: ['path/waypoints', 'obstacle/detection'],
    parameters: {
      algorithm: {
        type: 'string',
        value: 'A*',
        required: true,
        description: '路径规划算法'
      },
      safetyDistance: {
        type: 'number',
        value: 1.5,
        required: true,
        description: '安全距离(米)'
      },
      maxSpeed: {
        type: 'number',
        value: 2.0,
        required: false,
        description: '最大速度(m/s)'
      }
    },
    interfaces: {
      input: ['gps_data', 'lidar_data', 'target_coordinates'],
      output: ['navigation_path', 'movement_commands']
    },
    dependencies: ['positioning_service', 'obstacle_detection'],
    performance: {
      latency: 200,
      throughput: 5,
      accuracy: 92.8
    },
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-07-14T11:45:00Z',
    lastTested: '2024-07-17T08:15:00Z',
    testResults: {
      success: 156,
      failed: 24,
      lastResult: 'pending'
    }
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
    category: capability?.category || 'input',
    description: capability?.description || '',
    deviceId: capability?.deviceId || '',
    status: capability?.status || 'inactive',
    dataTypes: capability?.dataTypes?.join(', ') || '',
    dependencies: capability?.dependencies?.join(', ') || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock设备数据
  const devices = [
    { value: 'device-1', label: '巡检无人机-01' },
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
    { value: 'input', label: '输入' },
    { value: 'output', label: '输出' },
    { value: 'processing', label: '处理' },
    { value: 'storage', label: '存储' }
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
      deviceName: selectedDevice?.label,
      dataTypes: formData.dataTypes.split(',').map(t => t.trim()).filter(Boolean),
      dependencies: formData.dependencies.split(',').map(d => d.trim()).filter(Boolean),
      parameters: capability?.parameters || {},
      interfaces: capability?.interfaces || { input: [], output: [] },
      performance: capability?.performance || { latency: 0, throughput: 0, accuracy: 0 },
      testResults: capability?.testResults || { success: 0, failed: 0, lastResult: 'pending' },
      updatedAt: new Date().toISOString()
    };

    if (capability) {
      capabilityData.id = capability.id;
    } else {
      capabilityData.id = `cap-${Date.now()}`;
      capabilityData.createdAt = new Date().toISOString();
      capabilityData.lastTested = new Date().toISOString();
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
          rows={3}
        />
      </FormField>

      <FormField label="依赖服务">
        <Input
          value={formData.dependencies}
          onChange={(e) => setFormData({ ...formData, dependencies: e.target.value })}
          placeholder="请输入依赖服务，用逗号分隔"
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

  const handleTestCapability = (capability: DeviceCapability) => {
    // 模拟测试能力
    setCapabilities(capabilities.map(c =>
      c.id === capability.id
        ? { ...c, status: 'testing', lastTested: new Date().toISOString() }
        : c
    ));

    // 模拟测试完成
    setTimeout(() => {
      setCapabilities(prev => prev.map(c =>
        c.id === capability.id
          ? {
              ...c,
              status: 'active',
              testResults: {
                ...c.testResults,
                success: c.testResults.success + 1,
                lastResult: 'success'
              }
            }
          : c
      ));
    }, 3000);
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Play className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">测试中</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {capabilities.filter(c => c.status === 'testing').length}
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
                <p className="text-sm text-gray-600">平均准确率</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(capabilities.reduce((sum, c) => sum + c.performance.accuracy, 0) / capabilities.length)}%
                </p>
              </div>
              <Cpu className="h-8 w-8 text-purple-400" />
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
                <TableHead>能力名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>关联设备</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>性能指标</TableHead>
                <TableHead>测试结果</TableHead>
                <TableHead>最后测试</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCapabilities.map((capability) => {
                const TypeIcon = getTypeIcon(capability.type);
                return (
                  <TableRow key={capability.id}>
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
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{capability.deviceName}</div>
                        <div className="text-gray-500">{capability.dataTypes.slice(0, 2).join(', ')}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={capability.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>延迟: {capability.performance.latency}ms</div>
                        <div>准确率: {capability.performance.accuracy}%</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div className="text-green-600">成功: {capability.testResults.success}</div>
                        <div className="text-red-600">失败: {capability.testResults.failed}</div>
                      </div>
                    </TableCell>
                    <TableCell>{formatRelativeTime(capability.lastTested)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestCapability(capability)}
                          disabled={capability.status === 'testing'}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
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
