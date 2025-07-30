import React from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  MapPin,
  Battery,
  Wifi,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter, ConfirmModal } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useDevices, useDeviceStore } from '../../stores/useDeviceStore';
import { mockDevices } from '../../mocks/data';
import { formatRelativeTime } from '../../lib/utils';
import type { Device } from '../../types';

// 设备表单组件
interface DeviceFormProps {
  device?: Device;
  onSubmit: (device: Partial<Device>) => void;
  onCancel: () => void;
}

function DeviceForm({ device, onSubmit, onCancel }: DeviceFormProps) {
  const [formData, setFormData] = React.useState({
    name: device?.name || '',
    type: device?.type || '',
    model: device?.model || '',
    serialNumber: device?.serialNumber || '',
    status: device?.status || 'offline',
    location: {
      lat: device?.location?.lat || 0,
      lng: device?.location?.lng || 0,
    },
    capabilities: device?.capabilities?.join(', ') || '',
  });

  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const deviceTypes = [
    { value: 'drone', label: '无人机' },
    { value: 'camera', label: '摄像头' },
    { value: 'robot', label: '机器人' },
    { value: 'sensor', label: '传感器' },
  ];

  const statusOptions = [
    { value: 'online', label: '在线' },
    { value: 'offline', label: '离线' },
    { value: 'maintenance', label: '维护中' },
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '设备名称不能为空';
    }
    if (!formData.type) {
      newErrors.type = '请选择设备类型';
    }
    if (!formData.serialNumber.trim()) {
      newErrors.serialNumber = '序列号不能为空';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const deviceData: Partial<Device> = {
      ...formData,
      capabilities: formData.capabilities.split(',').map(c => c.trim()).filter(Boolean),
      lastUpdate: new Date().toISOString(),
    };

    if (device) {
      deviceData.id = device.id;
    } else {
      deviceData.id = `device-${Date.now()}`;
    }

    onSubmit(deviceData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="设备名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入设备名称"
          />
        </FormField>

        <FormField label="设备类型" required error={errors.type}>
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as Device['type'] })}
            options={deviceTypes}
            placeholder="请选择设备类型"
          />
        </FormField>

        <FormField label="设备型号" error={errors.model}>
          <Input
            value={formData.model}
            onChange={(e) => setFormData({ ...formData, model: e.target.value })}
            placeholder="请输入设备型号"
          />
        </FormField>

        <FormField label="序列号" required error={errors.serialNumber}>
          <Input
            value={formData.serialNumber}
            onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
            placeholder="请输入序列号"
          />
        </FormField>

        <FormField label="设备状态" error={errors.status}>
          <Select
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as Device['status'] })}
            options={statusOptions}
          />
        </FormField>

        <FormField label="位置坐标">
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              step="any"
              value={formData.location.lat}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, lat: parseFloat(e.target.value) || 0 }
              })}
              placeholder="纬度"
            />
            <Input
              type="number"
              step="any"
              value={formData.location.lng}
              onChange={(e) => setFormData({
                ...formData,
                location: { ...formData.location, lng: parseFloat(e.target.value) || 0 }
              })}
              placeholder="经度"
            />
          </div>
        </FormField>
      </div>

      <FormField label="设备能力" className="col-span-2">
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
          {device ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function DeviceList() {
  const devices = useDevices();
  const { setDevices, addDevice, updateDevice, removeDevice, setSelectedDevice } = useDeviceStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [typeFilter, setTypeFilter] = React.useState<string>('all');

  // 模态框状态
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [selectedDevice, setSelectedDeviceLocal] = React.useState<Device | null>(null);

  // 初始化设备数据
  React.useEffect(() => {
    if (devices.length === 0) {
      setDevices(mockDevices);
    }
  }, [devices.length, setDevices]);

  // 过滤设备
  const filteredDevices = React.useMemo(() => {
    return devices.filter(device => {
      const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           device.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           device.serialNumber?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || device.status === statusFilter;
      const matchesType = typeFilter === 'all' || device.type === typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [devices, searchTerm, statusFilter, typeFilter]);

  // 设备类型映射
  const deviceTypeMap = {
    camera: '摄像头',
    drone: '无人机',
    robot: '机器人',
    sensor: '传感器',
  };

  // 状态映射
  const statusMap = {
    online: '在线',
    offline: '离线',
    maintenance: '维护中',
  };

  // 事件处理函数
  const handleViewDevice = (device: Device) => {
    setSelectedDevice(device);
    // TODO: 打开设备详情模态框
  };

  const handleEditDevice = (device: Device) => {
    setSelectedDeviceLocal(device);
    setShowEditModal(true);
  };

  const handleDeleteDevice = (device: Device) => {
    setSelectedDeviceLocal(device);
    setShowDeleteModal(true);
  };

  const handleAddDevice = (deviceData: Partial<Device>) => {
    addDevice(deviceData as Device);
    setShowAddModal(false);
  };

  const handleUpdateDevice = (deviceData: Partial<Device>) => {
    if (selectedDevice?.id) {
      updateDevice(selectedDevice.id, deviceData);
      setShowEditModal(false);
      setSelectedDeviceLocal(null);
    }
  };

  const handleConfirmDelete = () => {
    if (selectedDevice?.id) {
      removeDevice(selectedDevice.id);
      setShowDeleteModal(false);
      setSelectedDeviceLocal(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">设备管理</h1>
          <p className="text-gray-600 mt-1">管理和监控所有巡检设备</p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          添加设备
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">设备总数</p>
                <p className="text-2xl font-bold">{devices.length}</p>
              </div>
              <Settings className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">在线设备</p>
                <p className="text-2xl font-bold text-green-600">
                  {devices.filter(d => d.status === 'online').length}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">离线设备</p>
                <p className="text-2xl font-bold text-red-600">
                  {devices.filter(d => d.status === 'offline').length}
                </p>
              </div>
              <Wifi className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">维护中</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {devices.filter(d => d.status === 'maintenance').length}
                </p>
              </div>
              <Settings className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索和过滤 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="搜索设备名称、型号或序列号..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">所有状态</option>
              <option value="online">在线</option>
              <option value="offline">离线</option>
              <option value="maintenance">维护中</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">所有类型</option>
              <option value="camera">摄像头</option>
              <option value="drone">无人机</option>
              <option value="robot">机器人</option>
              <option value="sensor">传感器</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 设备列表 */}
      <Card>
        <CardHeader>
          <CardTitle>设备列表 ({filteredDevices.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>设备信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>位置</TableHead>
                <TableHead>电池</TableHead>
                <TableHead>最后更新</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-sm text-gray-500">
                        {device.model} • {device.serialNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {deviceTypeMap[device.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={device.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-3 w-3 mr-1" />
                      {device.location.lat.toFixed(4)}, {device.location.lng.toFixed(4)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {device.batteryLevel !== undefined ? (
                      <div className="flex items-center">
                        <Battery className="h-4 w-4 mr-1" />
                        <span className={`text-sm ${
                          device.batteryLevel > 50 ? 'text-green-600' :
                          device.batteryLevel > 20 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {device.batteryLevel}%
                        </span>
                      </div>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600">
                      {formatRelativeTime(device.lastUpdate)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDevice(device)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDevice(device)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDevice(device)}
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

      {/* 添加设备模态框 */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="添加设备"
        size="lg"
      >
        <DeviceForm
          onSubmit={handleAddDevice}
          onCancel={() => setShowAddModal(false)}
        />
      </Modal>

      {/* 编辑设备模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDeviceLocal(null);
        }}
        title="编辑设备"
        size="lg"
      >
        <DeviceForm
          device={selectedDevice || undefined}
          onSubmit={handleUpdateDevice}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedDeviceLocal(null);
          }}
        />
      </Modal>

      {/* 删除确认模态框 */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedDeviceLocal(null);
        }}
        onConfirm={handleConfirmDelete}
        title="删除设备"
        message={`确定要删除设备 "${selectedDevice?.name}" 吗？此操作不可撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
      />
    </div>
  );
}

export default DeviceList;
