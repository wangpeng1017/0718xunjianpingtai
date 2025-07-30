import React, { useState } from 'react';
import {
  Route,
  MapPin,
  Navigation,
  Clock,
  Zap,
  Target,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Save,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import { Modal, ModalFooter } from '../../components/ui/Modal';
import { Form, FormField, Select, TextArea } from '../../components/ui/Form';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 路径优化类型定义
interface RouteOptimization {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'auto' | 'hybrid';
  algorithm: 'shortest_path' | 'fastest_time' | 'energy_efficient' | 'balanced';
  status: 'draft' | 'optimizing' | 'completed' | 'failed';
  targets: {
    id: string;
    name: string;
    location: {
      lat: number;
      lng: number;
    };
    priority: number;
    estimatedDuration: number;
    requirements: string[];
  }[];
  optimizedRoute: {
    sequence: string[];
    totalDistance: number;
    totalTime: number;
    energyConsumption: number;
    waypoints: {
      targetId: string;
      arrivalTime: string;
      departureTime: string;
      duration: number;
    }[];
  };
  constraints: {
    maxDistance: number;
    maxTime: number;
    maxEnergyConsumption: number;
    deviceCapabilities: string[];
    weatherConditions: string[];
    timeWindows: {
      targetId: string;
      startTime: string;
      endTime: string;
    }[];
  };
  optimization: {
    startedAt?: string;
    completedAt?: string;
    iterations: number;
    improvementRate: number;
    finalScore: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

// Mock数据
const mockRouteOptimizations: RouteOptimization[] = [
  {
    id: 'route-1',
    name: '东区日常巡检路径优化',
    description: '优化东区变电站的日常巡检路径，减少巡检时间和能耗',
    type: 'auto',
    algorithm: 'balanced',
    status: 'completed',
    targets: [
      {
        id: 'target-1',
        name: '主变压器A1',
        location: { lat: 39.9042, lng: 116.4074 },
        priority: 1,
        estimatedDuration: 15,
        requirements: ['温度检测', '外观检查']
      },
      {
        id: 'target-2',
        name: '配电柜B2',
        location: { lat: 39.9052, lng: 116.4084 },
        priority: 2,
        estimatedDuration: 10,
        requirements: ['电压检测', '开关状态检查']
      },
      {
        id: 'target-3',
        name: '冷却塔C1',
        location: { lat: 39.9062, lng: 116.4094 },
        priority: 3,
        estimatedDuration: 20,
        requirements: ['振动检测', '水质检测']
      }
    ],
    optimizedRoute: {
      sequence: ['target-1', 'target-2', 'target-3'],
      totalDistance: 2.5,
      totalTime: 65,
      energyConsumption: 15.2,
      waypoints: [
        {
          targetId: 'target-1',
          arrivalTime: '09:00:00',
          departureTime: '09:15:00',
          duration: 15
        },
        {
          targetId: 'target-2',
          arrivalTime: '09:25:00',
          departureTime: '09:35:00',
          duration: 10
        },
        {
          targetId: 'target-3',
          arrivalTime: '09:45:00',
          departureTime: '10:05:00',
          duration: 20
        }
      ]
    },
    constraints: {
      maxDistance: 5.0,
      maxTime: 120,
      maxEnergyConsumption: 25.0,
      deviceCapabilities: ['飞行', '温度检测', '图像采集'],
      weatherConditions: ['晴天', '小雨'],
      timeWindows: [
        {
          targetId: 'target-1',
          startTime: '08:00:00',
          endTime: '10:00:00'
        }
      ]
    },
    optimization: {
      startedAt: '2024-07-17T08:30:00Z',
      completedAt: '2024-07-17T08:35:00Z',
      iterations: 150,
      improvementRate: 23.5,
      finalScore: 92.3
    },
    createdAt: '2024-07-17T08:00:00Z',
    updatedAt: '2024-07-17T08:35:00Z',
    createdBy: '张工程师'
  },
  {
    id: 'route-2',
    name: '西区紧急巡检路径',
    description: '西区设备异常，需要紧急巡检路径规划',
    type: 'manual',
    algorithm: 'fastest_time',
    status: 'optimizing',
    targets: [
      {
        id: 'target-4',
        name: '高压开关柜D1',
        location: { lat: 39.9032, lng: 116.4064 },
        priority: 1,
        estimatedDuration: 25,
        requirements: ['紧急检查', '故障诊断']
      },
      {
        id: 'target-5',
        name: '变压器E2',
        location: { lat: 39.9022, lng: 116.4054 },
        priority: 2,
        estimatedDuration: 30,
        requirements: ['温度监控', '绝缘检测']
      }
    ],
    optimizedRoute: {
      sequence: [],
      totalDistance: 0,
      totalTime: 0,
      energyConsumption: 0,
      waypoints: []
    },
    constraints: {
      maxDistance: 3.0,
      maxTime: 90,
      maxEnergyConsumption: 20.0,
      deviceCapabilities: ['快速移动', '故障检测'],
      weatherConditions: ['任何天气'],
      timeWindows: []
    },
    optimization: {
      startedAt: '2024-07-17T10:00:00Z',
      iterations: 0,
      improvementRate: 0,
      finalScore: 0
    },
    createdAt: '2024-07-17T09:45:00Z',
    updatedAt: '2024-07-17T10:00:00Z',
    createdBy: '李主管'
  }
];

// 路径优化表单组件
interface RouteFormProps {
  route?: RouteOptimization;
  onSubmit: (route: Partial<RouteOptimization>) => void;
  onCancel: () => void;
}

function RouteForm({ route, onSubmit, onCancel }: RouteFormProps) {
  const [formData, setFormData] = useState({
    name: route?.name || '',
    description: route?.description || '',
    type: route?.type || 'auto',
    algorithm: route?.algorithm || 'balanced',
    maxDistance: route?.constraints?.maxDistance || 5.0,
    maxTime: route?.constraints?.maxTime || 120,
    maxEnergyConsumption: route?.constraints?.maxEnergyConsumption || 25.0
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const typeOptions = [
    { value: 'auto', label: '自动优化' },
    { value: 'manual', label: '手动规划' },
    { value: 'hybrid', label: '混合模式' }
  ];

  const algorithmOptions = [
    { value: 'shortest_path', label: '最短路径' },
    { value: 'fastest_time', label: '最快时间' },
    { value: 'energy_efficient', label: '节能优先' },
    { value: 'balanced', label: '平衡优化' }
  ];

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '路径名称不能为空';
    }
    if (!formData.description.trim()) {
      newErrors.description = '路径描述不能为空';
    }
    if (formData.maxDistance <= 0) {
      newErrors.maxDistance = '最大距离必须大于0';
    }
    if (formData.maxTime <= 0) {
      newErrors.maxTime = '最大时间必须大于0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const routeData: Partial<RouteOptimization> = {
      ...formData,
      targets: route?.targets || [],
      optimizedRoute: route?.optimizedRoute || {
        sequence: [],
        totalDistance: 0,
        totalTime: 0,
        energyConsumption: 0,
        waypoints: []
      },
      constraints: {
        maxDistance: formData.maxDistance,
        maxTime: formData.maxTime,
        maxEnergyConsumption: formData.maxEnergyConsumption,
        deviceCapabilities: route?.constraints?.deviceCapabilities || [],
        weatherConditions: route?.constraints?.weatherConditions || [],
        timeWindows: route?.constraints?.timeWindows || []
      },
      optimization: route?.optimization || {
        iterations: 0,
        improvementRate: 0,
        finalScore: 0
      },
      status: 'draft',
      createdBy: route?.createdBy || '当前用户',
      createdAt: route?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (route) {
      routeData.id = route.id;
    } else {
      routeData.id = `route-${Date.now()}`;
    }

    onSubmit(routeData);
  };

  return (
    <Form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="路径名称" required error={errors.name}>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入路径名称"
          />
        </FormField>

        <FormField label="优化类型">
          <Select
            value={formData.type}
            onChange={(value) => setFormData({ ...formData, type: value as RouteOptimization['type'] })}
            options={typeOptions}
          />
        </FormField>

        <FormField label="优化算法">
          <Select
            value={formData.algorithm}
            onChange={(value) => setFormData({ ...formData, algorithm: value as RouteOptimization['algorithm'] })}
            options={algorithmOptions}
          />
        </FormField>

        <FormField label="最大距离(km)" error={errors.maxDistance}>
          <Input
            type="number"
            step="0.1"
            value={formData.maxDistance}
            onChange={(e) => setFormData({ ...formData, maxDistance: parseFloat(e.target.value) || 0 })}
            placeholder="5.0"
          />
        </FormField>

        <FormField label="最大时间(分钟)" error={errors.maxTime}>
          <Input
            type="number"
            value={formData.maxTime}
            onChange={(e) => setFormData({ ...formData, maxTime: parseInt(e.target.value) || 0 })}
            placeholder="120"
          />
        </FormField>

        <FormField label="最大能耗(kWh)">
          <Input
            type="number"
            step="0.1"
            value={formData.maxEnergyConsumption}
            onChange={(e) => setFormData({ ...formData, maxEnergyConsumption: parseFloat(e.target.value) || 0 })}
            placeholder="25.0"
          />
        </FormField>
      </div>

      <FormField label="路径描述" required error={errors.description}>
        <TextArea
          value={formData.description}
          onChange={(value) => setFormData({ ...formData, description: value })}
          placeholder="请描述路径优化的目标和要求"
          rows={3}
        />
      </FormField>

      <ModalFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          取消
        </Button>
        <Button type="submit">
          {route ? '更新' : '创建'}
        </Button>
      </ModalFooter>
    </Form>
  );
}

function RouteOptimization() {
  const [routes, setRoutes] = useState<RouteOptimization[]>(mockRouteOptimizations);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRoute, setSelectedRoute] = useState<RouteOptimization | null>(null);
  
  // 模态框状态
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 筛选路径
  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         route.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || route.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || route.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // 事件处理函数
  const handleCreateRoute = (routeData: Partial<RouteOptimization>) => {
    setRoutes([routeData as RouteOptimization, ...routes]);
    setShowCreateModal(false);
  };

  const handleUpdateRoute = (routeData: Partial<RouteOptimization>) => {
    if (selectedRoute?.id) {
      setRoutes(routes.map(r => 
        r.id === selectedRoute.id ? { ...r, ...routeData } : r
      ));
      setShowEditModal(false);
      setSelectedRoute(null);
    }
  };

  const handleOptimizeRoute = (routeId: string) => {
    setRoutes(routes.map(r => {
      if (r.id === routeId) {
        return {
          ...r,
          status: 'optimizing',
          optimization: {
            ...r.optimization,
            startedAt: new Date().toISOString(),
            iterations: 0
          }
        };
      }
      return r;
    }));

    // 模拟优化过程
    setTimeout(() => {
      setRoutes(prev => prev.map(r => {
        if (r.id === routeId) {
          return {
            ...r,
            status: 'completed',
            optimization: {
              ...r.optimization,
              completedAt: new Date().toISOString(),
              iterations: Math.floor(Math.random() * 200) + 50,
              improvementRate: Math.floor(Math.random() * 30) + 10,
              finalScore: Math.floor(Math.random() * 20) + 80
            },
            optimizedRoute: {
              ...r.optimizedRoute,
              totalDistance: Math.random() * 5 + 1,
              totalTime: Math.floor(Math.random() * 60) + 30,
              energyConsumption: Math.random() * 20 + 5
            }
          };
        }
        return r;
      }));
    }, 3000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return Target;
      case 'optimizing': return Navigation;
      case 'failed': return Zap;
      default: return Route;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      auto: '自动优化',
      manual: '手动规划',
      hybrid: '混合模式'
    };
    return typeMap[type] || type;
  };

  const getAlgorithmLabel = (algorithm: string) => {
    const algorithmMap: Record<string, string> = {
      shortest_path: '最短路径',
      fastest_time: '最快时间',
      energy_efficient: '节能优先',
      balanced: '平衡优化'
    };
    return algorithmMap[algorithm] || algorithm;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">路径优化</h1>
        <p className="text-gray-600 mt-1">智能规划和优化巡检路径</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">路径总数</p>
                <p className="text-2xl font-bold">{routes.length}</p>
              </div>
              <Route className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">已完成</p>
                <p className="text-2xl font-bold text-green-600">
                  {routes.filter(r => r.status === 'completed').length}
                </p>
              </div>
              <Target className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">优化中</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {routes.filter(r => r.status === 'optimizing').length}
                </p>
              </div>
              <Navigation className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均优化率</p>
                <p className="text-2xl font-bold text-purple-600">
                  {routes.filter(r => r.optimization.improvementRate > 0)
                    .reduce((sum, r) => sum + r.optimization.improvementRate, 0) / 
                   Math.max(routes.filter(r => r.optimization.improvementRate > 0).length, 1)
                  }%
                </p>
              </div>
              <Zap className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主要内容 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>路径优化列表</CardTitle>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                算法设置
              </Button>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建路径
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选 */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Route className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="搜索路径名称或描述..."
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
                { value: 'auto', label: '自动优化' },
                { value: 'manual', label: '手动规划' },
                { value: 'hybrid', label: '混合模式' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'draft', label: '草稿' },
                { value: 'optimizing', label: '优化中' },
                { value: 'completed', label: '已完成' },
                { value: 'failed', label: '失败' }
              ]}
            />
          </div>

          {/* 路径表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>路径信息</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>算法</TableHead>
                <TableHead>目标数量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>优化结果</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoutes.map((route) => {
                const StatusIcon = getStatusIcon(route.status);
                return (
                  <TableRow key={route.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <StatusIcon className={`h-5 w-5 ${
                          route.status === 'completed' ? 'text-green-500' :
                          route.status === 'optimizing' ? 'text-yellow-500' :
                          route.status === 'failed' ? 'text-red-500' :
                          'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">{route.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {route.description}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        {getTypeLabel(route.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {getAlgorithmLabel(route.algorithm)}
                      </span>
                    </TableCell>
                    <TableCell>{route.targets.length}</TableCell>
                    <TableCell>
                      <StatusBadge status={route.status} />
                    </TableCell>
                    <TableCell>
                      {route.status === 'completed' ? (
                        <div className="text-sm">
                          <div>距离: {route.optimizedRoute.totalDistance.toFixed(1)}km</div>
                          <div className="text-gray-500">时间: {route.optimizedRoute.totalTime}分钟</div>
                          <div className="text-green-600">优化: {route.optimization.improvementRate}%</div>
                        </div>
                      ) : route.status === 'optimizing' ? (
                        <div className="text-sm text-yellow-600">
                          优化中... ({route.optimization.iterations}次迭代)
                        </div>
                      ) : (
                        <span className="text-gray-400">待优化</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatRelativeTime(route.createdAt)}</div>
                        <div className="text-gray-500">by {route.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRoute(route);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {route.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOptimizeRoute(route.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}

                        {route.status === 'optimizing' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-yellow-600 hover:text-yellow-700"
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        )}

                        {route.status === 'completed' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOptimizeRoute(route.id)}
                              className="text-purple-600 hover:text-purple-700"
                            >
                              <RotateCcw className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRoute(route);
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

      {/* 创建路径模态框 */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="创建路径优化"
        size="lg"
      >
        <RouteForm
          onSubmit={handleCreateRoute}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* 编辑路径模态框 */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedRoute(null);
        }}
        title="编辑路径优化"
        size="lg"
      >
        <RouteForm
          route={selectedRoute || undefined}
          onSubmit={handleUpdateRoute}
          onCancel={() => {
            setShowEditModal(false);
            setSelectedRoute(null);
          }}
        />
      </Modal>

      {/* 路径详情模态框 */}
      {selectedRoute && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRoute(null);
          }}
          title="路径详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">路径名称:</span> {selectedRoute.name}</div>
                  <div><span className="text-gray-500">优化类型:</span> {getTypeLabel(selectedRoute.type)}</div>
                  <div><span className="text-gray-500">算法:</span> {getAlgorithmLabel(selectedRoute.algorithm)}</div>
                  <div><span className="text-gray-500">创建者:</span> {selectedRoute.createdBy}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">约束条件</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">最大距离:</span> {selectedRoute.constraints.maxDistance}km</div>
                  <div><span className="text-gray-500">最大时间:</span> {selectedRoute.constraints.maxTime}分钟</div>
                  <div><span className="text-gray-500">最大能耗:</span> {selectedRoute.constraints.maxEnergyConsumption}kWh</div>
                </div>
              </div>
            </div>

            {/* 优化结果 */}
            {selectedRoute.status === 'completed' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">优化结果</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-blue-600 font-medium">总距离</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {selectedRoute.optimizedRoute.totalDistance.toFixed(1)}km
                    </div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-green-600 font-medium">总时间</div>
                    <div className="text-2xl font-bold text-green-800">
                      {selectedRoute.optimizedRoute.totalTime}分钟
                    </div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-purple-600 font-medium">能耗</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {selectedRoute.optimizedRoute.energyConsumption.toFixed(1)}kWh
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 目标列表 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-2">巡检目标</h4>
              <div className="space-y-2">
                {selectedRoute.targets.map((target, index) => (
                  <div key={target.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{target.name}</div>
                        <div className="text-sm text-gray-500">
                          优先级: {target.priority} • 预计时长: {target.estimatedDuration}分钟
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {target.location.lat.toFixed(4)}, {target.location.lng.toFixed(4)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 优化过程 */}
            {selectedRoute.optimization.iterations > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">优化过程</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">迭代次数:</span>
                    <div className="font-medium">{selectedRoute.optimization.iterations}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">改进率:</span>
                    <div className="font-medium text-green-600">{selectedRoute.optimization.improvementRate}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">最终得分:</span>
                    <div className="font-medium">{selectedRoute.optimization.finalScore}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">优化时长:</span>
                    <div className="font-medium">
                      {selectedRoute.optimization.completedAt && selectedRoute.optimization.startedAt
                        ? Math.round((new Date(selectedRoute.optimization.completedAt).getTime() -
                                    new Date(selectedRoute.optimization.startedAt).getTime()) / 1000)
                        : 0}秒
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 路径序列 */}
            {selectedRoute.optimizedRoute.sequence.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-2">优化路径序列</h4>
                <div className="space-y-2">
                  {selectedRoute.optimizedRoute.waypoints.map((waypoint, index) => {
                    const target = selectedRoute.targets.find(t => t.id === waypoint.targetId);
                    return (
                      <div key={waypoint.targetId} className="flex items-center space-x-4 p-3 border rounded-lg">
                        <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{target?.name}</div>
                          <div className="text-sm text-gray-500">
                            到达: {waypoint.arrivalTime} • 离开: {waypoint.departureTime} •
                            停留: {waypoint.duration}分钟
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            {selectedRoute.status === 'completed' && (
              <Button>
                <Download className="h-4 w-4 mr-2" />
                导出路径
              </Button>
            )}
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default RouteOptimization;
