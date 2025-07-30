import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Settings,
  Play,
  Save,
  Copy,
  Download,
  Upload,
  Layers,
  GitBranch,
  Zap,
  Code,
  Database,
  Workflow
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 能力配置类型定义
interface CapabilityConfiguration {
  id: string;
  name: string;
  type: 'data_rule' | 'capability_type' | 'orchestration' | 'iot_integration';
  category: 'input' | 'output' | 'processing' | 'workflow';
  description: string;
  version: string;
  status: 'active' | 'inactive' | 'draft' | 'testing';
  configuration: {
    rules?: {
      [key: string]: {
        condition: string;
        action: string;
        priority: number;
      };
    };
    parameters?: {
      [key: string]: {
        type: string;
        value: any;
        validation: string;
      };
    };
    workflow?: {
      steps: {
        id: string;
        name: string;
        type: string;
        config: any;
      }[];
      connections: {
        from: string;
        to: string;
        condition?: string;
      }[];
    };
  };
  dependencies: string[];
  capabilities: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lastTested?: string;
  testResults?: {
    success: boolean;
    message: string;
    timestamp: string;
  };
}

// Mock数据
const mockConfigurations: CapabilityConfiguration[] = [
  {
    id: 'config-1',
    name: '温度异常检测规则',
    type: 'data_rule',
    category: 'processing',
    description: '检测设备温度异常并触发报警',
    version: '1.2.0',
    status: 'active',
    configuration: {
      rules: {
        'temp_high': {
          condition: 'temperature > 80',
          action: 'trigger_alarm',
          priority: 1
        },
        'temp_critical': {
          condition: 'temperature > 100',
          action: 'emergency_shutdown',
          priority: 0
        }
      },
      parameters: {
        'threshold_high': {
          type: 'number',
          value: 80,
          validation: 'min:0,max:200'
        },
        'threshold_critical': {
          type: 'number',
          value: 100,
          validation: 'min:0,max:200'
        }
      }
    },
    dependencies: ['thermal_sensor', 'alarm_system'],
    capabilities: ['temperature_monitoring', 'alert_management'],
    createdBy: '张工程师',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-07-15T14:30:00Z',
    lastTested: '2024-07-17T09:00:00Z',
    testResults: {
      success: true,
      message: '规则测试通过',
      timestamp: '2024-07-17T09:00:00Z'
    }
  },
  {
    id: 'config-2',
    name: '视频分析工作流',
    type: 'orchestration',
    category: 'workflow',
    description: '视频采集、处理、分析的完整工作流程',
    version: '2.1.0',
    status: 'active',
    configuration: {
      workflow: {
        steps: [
          {
            id: 'step-1',
            name: '视频采集',
            type: 'video_capture',
            config: { resolution: '4K', fps: 30 }
          },
          {
            id: 'step-2',
            name: '图像预处理',
            type: 'image_processing',
            config: { filters: ['noise_reduction', 'contrast_enhancement'] }
          },
          {
            id: 'step-3',
            name: 'AI分析',
            type: 'ai_analysis',
            config: { model: 'defect_detection_v2', confidence: 0.8 }
          },
          {
            id: 'step-4',
            name: '结果存储',
            type: 'data_storage',
            config: { format: 'json', retention: '30d' }
          }
        ],
        connections: [
          { from: 'step-1', to: 'step-2' },
          { from: 'step-2', to: 'step-3' },
          { from: 'step-3', to: 'step-4' }
        ]
      }
    },
    dependencies: ['video_capture', 'ai_engine', 'storage_service'],
    capabilities: ['video_processing', 'ai_analysis', 'data_management'],
    createdBy: '李技术员',
    createdAt: '2024-02-20T08:00:00Z',
    updatedAt: '2024-07-10T16:20:00Z',
    lastTested: '2024-07-16T15:30:00Z',
    testResults: {
      success: true,
      message: '工作流测试成功',
      timestamp: '2024-07-16T15:30:00Z'
    }
  },
  {
    id: 'config-3',
    name: 'IoT设备集成配置',
    type: 'iot_integration',
    category: 'input',
    description: '第三方IoT设备接入配置',
    version: '1.0.0',
    status: 'testing',
    configuration: {
      parameters: {
        'mqtt_broker': {
          type: 'string',
          value: 'mqtt://iot.example.com:1883',
          validation: 'url'
        },
        'device_types': {
          type: 'array',
          value: ['sensor', 'camera', 'controller'],
          validation: 'required'
        },
        'data_format': {
          type: 'string',
          value: 'json',
          validation: 'enum:json,xml,binary'
        }
      }
    },
    dependencies: ['mqtt_client', 'data_parser'],
    capabilities: ['device_integration', 'data_ingestion'],
    createdBy: '王维护员',
    createdAt: '2024-03-10T12:00:00Z',
    updatedAt: '2024-07-14T11:45:00Z',
    lastTested: '2024-07-17T08:15:00Z',
    testResults: {
      success: false,
      message: '连接超时，请检查网络配置',
      timestamp: '2024-07-17T08:15:00Z'
    }
  }
];

// 配置表单组件
interface ConfigurationFormProps {
  configuration?: CapabilityConfiguration;
  onSubmit: (configuration: Partial<CapabilityConfiguration>) => void;
  onCancel: () => void;
}

function ConfigurationForm({ configuration, onSubmit, onCancel }: ConfigurationFormProps) {
  const [formData, setFormData] = useState({
    name: configuration?.name || '',
    type: configuration?.type || 'data_rule',
    category: configuration?.category || 'processing',
    description: configuration?.description || '',
    version: configuration?.version || '1.0.0',
    status: configuration?.status || 'draft',
    dependencies: configuration?.dependencies?.join(', ') || '',
    capabilities: configuration?.capabilities?.join(', ') || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const configTypes = [
    { value: 'data_rule', label: '数据规则' },
    { value: 'capability_type', label: '能力类型' },
    { value: 'orchestration', label: '能力编排' },
    { value: 'iot_integration', label: 'IoT集成' }
  ];

  const categoryOptions = [
    { value: 'input', label: '输入' },
    { value: 'output', label: '输出' },
    { value: 'processing', label: '处理' },
    { value: 'workflow', label: '工作流' }
  ];

  const statusOptions = [
    { value: 'active', label: '启用' },
    { value: 'inactive', label: '禁用' },
    { value: 'draft', label: '草稿' },
    { value: 'testing', label: '测试中' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '配置名称不能为空';
    }
    if (!formData.version.trim()) {
      newErrors.version = '版本号不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const configData: Partial<CapabilityConfiguration> = {
      ...formData,
      dependencies: formData.dependencies.split(',').map(d => d.trim()).filter(Boolean),
      capabilities: formData.capabilities.split(',').map(c => c.trim()).filter(Boolean),
      configuration: configuration?.configuration || {},
      createdBy: configuration?.createdBy || '当前用户',
      updatedAt: new Date().toISOString()
    };

    if (configuration) {
      configData.id = configuration.id;
    } else {
      configData.id = `config-${Date.now()}`;
      configData.createdAt = new Date().toISOString();
    }

    onSubmit(configData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="配置名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入配置名称"
          />
        </FormField>

        <FormField label="配置类型">
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as CapabilityConfiguration['type'] })}
            options={configTypes}
          />
        </FormField>

        <FormField label="分类">
          <Select
            value={formData.category}
            onChange={(value) => setFormData({ ...formData, category: value as CapabilityConfiguration['category'] })}
            options={categoryOptions}
          />
        </FormField>

        <FormField label="版本号" required error={errors.version}>
          <Input
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            placeholder="请输入版本号"
          />
        </FormField>

        <FormField label="状态">
          <Select
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as CapabilityConfiguration['status'] })}
            options={statusOptions}
          />
        </FormField>
      </div>

      <FormField label="配置描述">
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请输入配置描述"
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

      <FormField label="关联能力">
        <Input
          value={formData.capabilities}
          onChange={(e) => setFormData({ ...formData, capabilities: e.target.value })}
          placeholder="请输入关联能力，用逗号分隔"
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {configuration ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function CapabilityConfiguration() {
  const [configurations, setConfigurations] = useState<CapabilityConfiguration[]>(mockConfigurations);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedConfiguration, setSelectedConfiguration] = useState<CapabilityConfiguration | null>(null);

  // 筛选配置
  const filteredConfigurations = configurations.filter(config => {
    const matchesSearch = config.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         config.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || config.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || config.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // 事件处理函数
  const handleAddConfiguration = (configData: Partial<CapabilityConfiguration>) => {
    setConfigurations([...configurations, configData as CapabilityConfiguration]);
    setShowAddModal(false);
  };

  const handleUpdateConfiguration = (configData: Partial<CapabilityConfiguration>) => {
    if (selectedConfiguration?.id) {
      setConfigurations(configurations.map(c => 
        c.id === selectedConfiguration.id ? { ...c, ...configData } : c
      ));
      setShowEditModal(false);
      setSelectedConfiguration(null);
    }
  };

  const handleDeleteConfiguration = () => {
    if (selectedConfiguration?.id) {
      setConfigurations(configurations.filter(c => c.id !== selectedConfiguration.id));
      setShowDeleteModal(false);
      setSelectedConfiguration(null);
    }
  };

  const handleTestConfiguration = (config: CapabilityConfiguration) => {
    // 模拟测试配置
    setConfigurations(configurations.map(c => 
      c.id === config.id 
        ? { ...c, status: 'testing', lastTested: new Date().toISOString() }
        : c
    ));
    
    // 模拟测试完成
    setTimeout(() => {
      setConfigurations(prev => prev.map(c => 
        c.id === config.id 
          ? { 
              ...c, 
              status: 'active',
              testResults: {
                success: Math.random() > 0.3,
                message: Math.random() > 0.3 ? '配置测试通过' : '配置测试失败',
                timestamp: new Date().toISOString()
              }
            }
          : c
      ));
    }, 3000);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'data_rule': return Database;
      case 'capability_type': return Zap;
      case 'orchestration': return Workflow;
      case 'iot_integration': return GitBranch;
      default: return Settings;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      data_rule: '数据规则',
      capability_type: '能力类型',
      orchestration: '能力编排',
      iot_integration: 'IoT集成'
    };
    return typeMap[type] || type;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">能力配置</h1>
        <p className="text-gray-600 mt-1">管理能力类型、数据规则和编排配置</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">配置总数</p>
                <p className="text-2xl font-bold">{configurations.length}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃配置</p>
                <p className="text-2xl font-bold text-green-600">
                  {configurations.filter(c => c.status === 'active').length}
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
                  {configurations.filter(c => c.status === 'testing').length}
                </p>
              </div>
              <Code className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">草稿</p>
                <p className="text-2xl font-bold text-gray-600">
                  {configurations.filter(c => c.status === 'draft').length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>能力配置列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                导入
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                导出
              </Button>
              <Button onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加配置
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
                  placeholder="搜索配置名称或描述..."
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
                { value: 'data_rule', label: '数据规则' },
                { value: 'capability_type', label: '能力类型' },
                { value: 'orchestration', label: '能力编排' },
                { value: 'iot_integration', label: 'IoT集成' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: '启用' },
                { value: 'inactive', label: '禁用' },
                { value: 'draft', label: '草稿' },
                { value: 'testing', label: '测试中' }
              ]}
            />
          </div>

          {/* 配置表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>配置名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>版本</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>关联能力</TableHead>
                <TableHead>测试结果</TableHead>
                <TableHead>创建者</TableHead>
                <TableHead>更新时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfigurations.map((config) => {
                const TypeIcon = getTypeIcon(config.type);
                return (
                  <TableRow key={config.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <TypeIcon className="h-5 w-5 text-gray-400" />
                        <div>
                          <div className="font-medium">{config.name}</div>
                          <div className="text-sm text-gray-500">{config.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getTypeLabel(config.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">{config.version}</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={config.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {config.capabilities.slice(0, 2).map(cap => (
                          <div key={cap} className="text-gray-600">{cap}</div>
                        ))}
                        {config.capabilities.length > 2 && (
                          <div className="text-gray-400">+{config.capabilities.length - 2} 更多</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {config.testResults ? (
                        <div className="text-sm">
                          <div className={config.testResults.success ? 'text-green-600' : 'text-red-600'}>
                            {config.testResults.success ? '通过' : '失败'}
                          </div>
                          <div className="text-gray-500">{formatRelativeTime(config.testResults.timestamp)}</div>
                        </div>
                      ) : (
                        <span className="text-gray-400">未测试</span>
                      )}
                    </TableCell>
                    <TableCell>{config.createdBy}</TableCell>
                    <TableCell>{formatRelativeTime(config.updatedAt)}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTestConfiguration(config)}
                          disabled={config.status === 'testing'}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-600 hover:text-gray-700"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedConfiguration(config);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedConfiguration(config);
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

      {/* 添加配置模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加能力配置"
        size="lg"
      >
        <ConfigurationForm
          onSubmit={handleAddConfiguration}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 编辑配置模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedConfiguration(null);
        }}
        title="编辑能力配置"
        size="lg"
      >
        <ConfigurationForm
          configuration={selectedConfiguration || undefined}
          onSubmit={handleUpdateConfiguration}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedConfiguration(null);
          }}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedConfiguration(null);
        }}
        onConfirm={handleDeleteConfiguration}
        title="删除配置"
        message={`确定要删除配置 "${selectedConfiguration?.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default CapabilityConfiguration;
