import React, { useState } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Network,
  Settings,
  CheckCircle,
  AlertTriangle,
  Play,
  Pause
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 协议接口类型定义
interface ProtocolInterface {
  id: string;
  name: string;
  type: 'MQTT' | 'HTTP' | 'WebSocket' | 'TCP' | 'UDP' | 'RTSP' | 'ONVIF' | 'ROS' | 'LoRaWAN';
  version: string;
  description: string;
  endpoint: string;
  port: number;
  authentication: {
    type: 'none' | 'basic' | 'token' | 'certificate';
    credentials?: string;
  };
  parameters: {
    [key: string]: string | number | boolean;
  };
  status: 'active' | 'inactive' | 'testing';
  deviceTypes: string[];
  createdAt: string;
  updatedAt: string;
  lastTested: string;
  connectedDevices: number;
}

// Mock数据
const mockProtocols: ProtocolInterface[] = [
  {
    id: 'protocol-1',
    name: 'MQTT消息队列',
    type: 'MQTT',
    version: '3.1.1',
    description: '用于设备消息传输的MQTT协议接口',
    endpoint: 'mqtt://broker.example.com',
    port: 1883,
    authentication: {
      type: 'basic',
      credentials: 'username:password'
    },
    parameters: {
      keepAlive: 60,
      cleanSession: true,
      qos: 1
    },
    status: 'active',
    deviceTypes: ['drone', 'robot', 'sensor'],
    createdAt: '2024-01-10T08:00:00Z',
    updatedAt: '2024-07-15T10:30:00Z',
    lastTested: '2024-07-17T09:15:00Z',
    connectedDevices: 25
  },
  {
    id: 'protocol-2',
    name: 'HTTP RESTful API',
    type: 'HTTP',
    version: '1.1',
    description: '基于HTTP的RESTful API接口',
    endpoint: 'https://api.example.com',
    port: 443,
    authentication: {
      type: 'token',
      credentials: 'Bearer token'
    },
    parameters: {
      timeout: 30000,
      retries: 3,
      contentType: 'application/json'
    },
    status: 'active',
    deviceTypes: ['camera', 'sensor'],
    createdAt: '2024-02-15T14:20:00Z',
    updatedAt: '2024-07-10T16:45:00Z',
    lastTested: '2024-07-17T08:30:00Z',
    connectedDevices: 18
  },
  {
    id: 'protocol-3',
    name: 'RTSP视频流',
    type: 'RTSP',
    version: '2.0',
    description: '实时流传输协议，用于视频数据传输',
    endpoint: 'rtsp://camera.example.com',
    port: 554,
    authentication: {
      type: 'basic',
      credentials: 'admin:password'
    },
    parameters: {
      transport: 'TCP',
      profile: 'baseline',
      resolution: '1920x1080'
    },
    status: 'active',
    deviceTypes: ['camera'],
    createdAt: '2024-03-20T11:10:00Z',
    updatedAt: '2024-07-12T13:25:00Z',
    lastTested: '2024-07-16T15:20:00Z',
    connectedDevices: 12
  },
  {
    id: 'protocol-4',
    name: 'ROS机器人系统',
    type: 'ROS',
    version: '2.0',
    description: '机器人操作系统通信协议',
    endpoint: 'ros://master.example.com',
    port: 11311,
    authentication: {
      type: 'none'
    },
    parameters: {
      namespace: '/inspection',
      nodeTimeout: 10,
      messageQueue: 100
    },
    status: 'testing',
    deviceTypes: ['robot'],
    createdAt: '2024-04-05T09:30:00Z',
    updatedAt: '2024-07-14T11:15:00Z',
    lastTested: '2024-07-17T07:45:00Z',
    connectedDevices: 5
  }
];

// 协议表单组件
interface ProtocolFormProps {
  protocol?: ProtocolInterface;
  onSubmit: (protocol: Partial<ProtocolInterface>) => void;
  onCancel: () => void;
}

function ProtocolForm({ protocol, onSubmit, onCancel }: ProtocolFormProps) {
  const [formData, setFormData] = useState({
    name: protocol?.name || '',
    type: protocol?.type || 'MQTT',
    version: protocol?.version || '1.0',
    description: protocol?.description || '',
    endpoint: protocol?.endpoint || '',
    port: protocol?.port || 80,
    authType: protocol?.authentication?.type || 'none',
    credentials: protocol?.authentication?.credentials || '',
    status: protocol?.status || 'inactive',
    deviceTypes: protocol?.deviceTypes?.join(', ') || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const protocolTypes = [
    { value: 'MQTT', label: 'MQTT' },
    { value: 'HTTP', label: 'HTTP' },
    { value: 'WebSocket', label: 'WebSocket' },
    { value: 'TCP', label: 'TCP' },
    { value: 'UDP', label: 'UDP' },
    { value: 'RTSP', label: 'RTSP' },
    { value: 'ONVIF', label: 'ONVIF' },
    { value: 'ROS', label: 'ROS' },
    { value: 'LoRaWAN', label: 'LoRaWAN' }
  ];

  const authTypes = [
    { value: 'none', label: '无认证' },
    { value: 'basic', label: '基础认证' },
    { value: 'token', label: 'Token认证' },
    { value: 'certificate', label: '证书认证' }
  ];

  const statusOptions = [
    { value: 'active', label: '启用' },
    { value: 'inactive', label: '禁用' },
    { value: 'testing', label: '测试中' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '协议名称不能为空';
    }
    if (!formData.endpoint.trim()) {
      newErrors.endpoint = '端点地址不能为空';
    }
    if (!formData.port || formData.port < 1 || formData.port > 65535) {
      newErrors.port = '端口号必须在1-65535之间';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const protocolData: Partial<ProtocolInterface> = {
      ...formData,
      authentication: {
        type: formData.authType as ProtocolInterface['authentication']['type'],
        credentials: formData.credentials || undefined
      },
      deviceTypes: formData.deviceTypes.split(',').map(t => t.trim()).filter(Boolean),
      parameters: protocol?.parameters || {},
      updatedAt: new Date().toISOString(),
      lastTested: new Date().toISOString()
    };

    if (protocol) {
      protocolData.id = protocol.id;
    } else {
      protocolData.id = `protocol-${Date.now()}`;
      protocolData.createdAt = new Date().toISOString();
      protocolData.connectedDevices = 0;
    }

    onSubmit(protocolData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="协议名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入协议名称"
          />
        </FormField>

        <FormField label="协议类型" required>
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as ProtocolInterface['type'] })}
            options={protocolTypes}
          />
        </FormField>

        <FormField label="版本号">
          <Input
            value={formData.version}
            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
            placeholder="请输入版本号"
          />
        </FormField>

        <FormField label="状态">
          <Select
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as ProtocolInterface['status'] })}
            options={statusOptions}
          />
        </FormField>

        <FormField label="端点地址" required error={errors.endpoint}>
          <Input
            value={formData.endpoint}
            onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
            placeholder="请输入端点地址"
          />
        </FormField>

        <FormField label="端口号" required error={errors.port}>
          <Input
            type="number"
            value={formData.port}
            onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 0 })}
            placeholder="请输入端口号"
          />
        </FormField>

        <FormField label="认证类型">
          <Select
            value={formData.authType}
            onChange={(value) => setFormData({ ...formData, authType: value })}
            options={authTypes}
          />
        </FormField>

        <FormField label="认证凭据">
          <Input
            value={formData.credentials}
            onChange={(e) => setFormData({ ...formData, credentials: e.target.value })}
            placeholder="请输入认证凭据"
            type={formData.authType === 'none' ? 'text' : 'password'}
            disabled={formData.authType === 'none'}
          />
        </FormField>
      </div>

      <FormField label="协议描述">
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请输入协议描述"
          rows={3}
        />
      </FormField>

      <FormField label="支持设备类型">
        <Input
          value={formData.deviceTypes}
          onChange={(e) => setFormData({ ...formData, deviceTypes: e.target.value })}
          placeholder="请输入支持的设备类型，用逗号分隔"
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {protocol ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function ProtocolInterface() {
  const [protocols, setProtocols] = useState<ProtocolInterface[]>(mockProtocols);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // 模态框状态
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProtocol, setSelectedProtocol] = useState<ProtocolInterface | null>(null);

  // 筛选协议
  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         protocol.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || protocol.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || protocol.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // 事件处理函数
  const handleAddProtocol = (protocolData: Partial<ProtocolInterface>) => {
    setProtocols([...protocols, protocolData as ProtocolInterface]);
    setShowAddModal(false);
  };

  const handleUpdateProtocol = (protocolData: Partial<ProtocolInterface>) => {
    if (selectedProtocol?.id) {
      setProtocols(protocols.map(p => 
        p.id === selectedProtocol.id ? { ...p, ...protocolData } : p
      ));
      setShowEditModal(false);
      setSelectedProtocol(null);
    }
  };

  const handleDeleteProtocol = () => {
    if (selectedProtocol?.id) {
      setProtocols(protocols.filter(p => p.id !== selectedProtocol.id));
      setShowDeleteModal(false);
      setSelectedProtocol(null);
    }
  };

  const handleTestProtocol = (protocol: ProtocolInterface) => {
    // 模拟测试协议连接
    setProtocols(protocols.map(p => 
      p.id === protocol.id 
        ? { ...p, status: 'testing', lastTested: new Date().toISOString() }
        : p
    ));
    
    // 模拟测试完成
    setTimeout(() => {
      setProtocols(prev => prev.map(p => 
        p.id === protocol.id 
          ? { ...p, status: 'active' }
          : p
      ));
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">协议接口</h1>
        <p className="text-gray-600 mt-1">管理设备通信协议接口配置</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">协议总数</p>
                <p className="text-2xl font-bold">{protocols.length}</p>
              </div>
              <Network className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">活跃协议</p>
                <p className="text-2xl font-bold text-green-600">
                  {protocols.filter(p => p.status === 'active').length}
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
                <p className="text-sm text-gray-600">测试中</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {protocols.filter(p => p.status === 'testing').length}
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
                <p className="text-sm text-gray-600">连接设备</p>
                <p className="text-2xl font-bold text-purple-600">
                  {protocols.reduce((sum, p) => sum + p.connectedDevices, 0)}
                </p>
              </div>
              <Network className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>协议列表</CardTitle>
            <Button onClick={() => setShowAddModal(true)}>
              <Plus className="h-4 w-4 mr-2" />
              添加协议
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
                  placeholder="搜索协议名称或描述..."
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
                { value: 'MQTT', label: 'MQTT' },
                { value: 'HTTP', label: 'HTTP' },
                { value: 'WebSocket', label: 'WebSocket' },
                { value: 'RTSP', label: 'RTSP' },
                { value: 'ROS', label: 'ROS' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'active', label: '启用' },
                { value: 'inactive', label: '禁用' },
                { value: 'testing', label: '测试中' }
              ]}
            />
          </div>

          {/* 协议表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>协议名称</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>端点</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>连接设备</TableHead>
                <TableHead>最后测试</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProtocols.map((protocol) => (
                <TableRow key={protocol.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{protocol.name}</div>
                      <div className="text-sm text-gray-500">{protocol.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                      {protocol.type} v{protocol.version}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{protocol.endpoint}</div>
                      <div className="text-gray-500">:{protocol.port}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={protocol.status} />
                  </TableCell>
                  <TableCell>{protocol.connectedDevices}</TableCell>
                  <TableCell>{formatRelativeTime(protocol.lastTested)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestProtocol(protocol)}
                        disabled={protocol.status === 'testing'}
                      >
                        {protocol.status === 'testing' ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProtocol(protocol);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedProtocol(protocol);
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

      {/* 添加协议模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加协议接口"
        size="lg"
      >
        <ProtocolForm
          onSubmit={handleAddProtocol}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 编辑协议模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedProtocol(null);
        }}
        title="编辑协议接口"
        size="lg"
      >
        <ProtocolForm
          protocol={selectedProtocol || undefined}
          onSubmit={handleUpdateProtocol}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedProtocol(null);
          }}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProtocol(null);
        }}
        onConfirm={handleDeleteProtocol}
        title="删除协议"
        message={`确定要删除协议 "${selectedProtocol?.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default ProtocolInterface;
