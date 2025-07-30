import React, { useState, useEffect } from 'react';
import {
  Route,
  MapPin,
  Navigation,
  Clock,
  Zap,
  Target,
  TrendingUp,
  Settings,
  Play,
  Pause,
  Square,
  RefreshCw,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  Map,
  Compass,
  Timer,
  Battery,
  Fuel
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
interface PathOptimization {
  id: string;
  name: string;
  description: string;
  type: 'shortest' | 'fastest' | 'energy_efficient' | 'balanced' | 'custom';
  status: 'draft' | 'optimizing' | 'completed' | 'failed' | 'active';
  priority: 'low' | 'medium' | 'high' | 'critical';
  scope: {
    area: string;
    devices: string[];
    checkpoints: {
      id: string;
      name: string;
      coordinates: { x: number; y: number; z?: number };
      type: 'start' | 'checkpoint' | 'end' | 'charging' | 'maintenance';
      priority: number;
      estimatedTime: number;
      requirements: string[];
    }[];
    constraints: {
      maxDistance: number;
      maxTime: number;
      energyLimit: number;
      weatherConditions: string[];
      accessRestrictions: string[];
    };
  };
  algorithm: {
    type: 'genetic' | 'ant_colony' | 'simulated_annealing' | 'dijkstra' | 'a_star' | 'hybrid';
    parameters: {
      populationSize?: number;
      generations?: number;
      mutationRate?: number;
      crossoverRate?: number;
      temperature?: number;
      coolingRate?: number;
      heuristic?: string;
    };
    weights: {
      distance: number;
      time: number;
      energy: number;
      safety: number;
      efficiency: number;
    };
  };
  results: {
    originalPath?: {
      distance: number;
      time: number;
      energy: number;
      waypoints: { x: number; y: number; z?: number }[];
    };
    optimizedPath: {
      distance: number;
      time: number;
      energy: number;
      waypoints: { x: number; y: number; z?: number }[];
      segments: {
        from: string;
        to: string;
        distance: number;
        time: number;
        energy: number;
        difficulty: 'easy' | 'medium' | 'hard';
      }[];
    };
    improvements: {
      distanceReduction: number;
      timeReduction: number;
      energySaving: number;
      efficiencyGain: number;
    };
    alternatives: {
      id: string;
      name: string;
      score: number;
      distance: number;
      time: number;
      energy: number;
      pros: string[];
      cons: string[];
    }[];
  };
  execution: {
    startTime?: string;
    endTime?: string;
    actualDistance?: number;
    actualTime?: number;
    actualEnergy?: number;
    deviations: {
      point: string;
      reason: string;
      impact: string;
      timestamp: string;
    }[];
    performance: {
      accuracy: number;
      efficiency: number;
      reliability: number;
    };
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    version: string;
    tags: string[];
    computationTime: number;
  };
}

// Mock数据
const mockOptimizations: PathOptimization[] = [
  {
    id: 'opt-1',
    name: '厂区A区域巡检路径优化',
    description: '优化A区域的日常巡检路径，提高巡检效率并降低能耗',
    type: 'balanced',
    status: 'completed',
    priority: 'high',
    scope: {
      area: 'A区域',
      devices: ['drone-01', 'robot-02'],
      checkpoints: [
        {
          id: 'cp-1',
          name: '起始点',
          coordinates: { x: 0, y: 0, z: 0 },
          type: 'start',
          priority: 1,
          estimatedTime: 0,
          requirements: []
        },
        {
          id: 'cp-2',
          name: '设备检查点1',
          coordinates: { x: 100, y: 50, z: 10 },
          type: 'checkpoint',
          priority: 3,
          estimatedTime: 15,
          requirements: ['温度检测', '振动监测']
        },
        {
          id: 'cp-3',
          name: '设备检查点2',
          coordinates: { x: 200, y: 100, z: 15 },
          type: 'checkpoint',
          priority: 2,
          estimatedTime: 20,
          requirements: ['视觉检查', '声音监测']
        },
        {
          id: 'cp-4',
          name: '充电站',
          coordinates: { x: 150, y: 200, z: 0 },
          type: 'charging',
          priority: 1,
          estimatedTime: 30,
          requirements: ['电池充电']
        },
        {
          id: 'cp-5',
          name: '结束点',
          coordinates: { x: 0, y: 0, z: 0 },
          type: 'end',
          priority: 1,
          estimatedTime: 0,
          requirements: []
        }
      ],
      constraints: {
        maxDistance: 1000,
        maxTime: 120,
        energyLimit: 80,
        weatherConditions: ['晴天', '小雨'],
        accessRestrictions: ['禁飞区域', '高温区域']
      }
    },
    algorithm: {
      type: 'hybrid',
      parameters: {
        populationSize: 100,
        generations: 50,
        mutationRate: 0.1,
        crossoverRate: 0.8
      },
      weights: {
        distance: 0.3,
        time: 0.3,
        energy: 0.2,
        safety: 0.15,
        efficiency: 0.05
      }
    },
    results: {
      originalPath: {
        distance: 850,
        time: 95,
        energy: 75,
        waypoints: [
          { x: 0, y: 0, z: 0 },
          { x: 100, y: 50, z: 10 },
          { x: 200, y: 100, z: 15 },
          { x: 150, y: 200, z: 0 },
          { x: 0, y: 0, z: 0 }
        ]
      },
      optimizedPath: {
        distance: 720,
        time: 78,
        energy: 62,
        waypoints: [
          { x: 0, y: 0, z: 0 },
          { x: 100, y: 50, z: 10 },
          { x: 150, y: 200, z: 0 },
          { x: 200, y: 100, z: 15 },
          { x: 0, y: 0, z: 0 }
        ],
        segments: [
          {
            from: '起始点',
            to: '设备检查点1',
            distance: 112,
            time: 8,
            energy: 12,
            difficulty: 'easy'
          },
          {
            from: '设备检查点1',
            to: '充电站',
            distance: 158,
            time: 12,
            energy: 18,
            difficulty: 'medium'
          },
          {
            from: '充电站',
            to: '设备检查点2',
            distance: 112,
            time: 8,
            energy: 12,
            difficulty: 'easy'
          },
          {
            from: '设备检查点2',
            to: '结束点',
            distance: 224,
            time: 16,
            energy: 20,
            difficulty: 'medium'
          }
        ]
      },
      improvements: {
        distanceReduction: 15.3,
        timeReduction: 17.9,
        energySaving: 17.3,
        efficiencyGain: 22.1
      },
      alternatives: [
        {
          id: 'alt-1',
          name: '最短距离路径',
          score: 85,
          distance: 680,
          time: 82,
          energy: 65,
          pros: ['距离最短', '能耗较低'],
          cons: ['时间稍长', '路径复杂']
        },
        {
          id: 'alt-2',
          name: '最快时间路径',
          score: 78,
          distance: 750,
          time: 72,
          energy: 68,
          pros: ['时间最短', '路径简单'],
          cons: ['距离较长', '能耗较高']
        }
      ]
    },
    execution: {
      startTime: '2024-07-17T09:00:00Z',
      endTime: '2024-07-17T10:18:00Z',
      actualDistance: 725,
      actualTime: 78,
      actualEnergy: 63,
      deviations: [
        {
          point: '设备检查点2',
          reason: '临时障碍物',
          impact: '绕行增加5米',
          timestamp: '2024-07-17T09:45:00Z'
        }
      ],
      performance: {
        accuracy: 98.5,
        efficiency: 96.2,
        reliability: 99.1
      }
    },
    metadata: {
      createdAt: '2024-07-16T14:00:00Z',
      updatedAt: '2024-07-17T10:20:00Z',
      createdBy: '路径规划系统',
      version: '2.1.0',
      tags: ['巡检优化', '能耗优化', 'A区域'],
      computationTime: 12.5
    }
  },
  {
    id: 'opt-2',
    name: 'B区域紧急巡检路径',
    description: '紧急情况下B区域的快速巡检路径规划',
    type: 'fastest',
    status: 'optimizing',
    priority: 'critical',
    scope: {
      area: 'B区域',
      devices: ['drone-02'],
      checkpoints: [
        {
          id: 'cp-6',
          name: '紧急起点',
          coordinates: { x: 300, y: 0, z: 0 },
          type: 'start',
          priority: 1,
          estimatedTime: 0,
          requirements: []
        },
        {
          id: 'cp-7',
          name: '故障设备',
          coordinates: { x: 400, y: 150, z: 20 },
          type: 'checkpoint',
          priority: 5,
          estimatedTime: 10,
          requirements: ['紧急检查']
        },
        {
          id: 'cp-8',
          name: '安全点',
          coordinates: { x: 350, y: 100, z: 0 },
          type: 'end',
          priority: 1,
          estimatedTime: 0,
          requirements: []
        }
      ],
      constraints: {
        maxDistance: 500,
        maxTime: 30,
        energyLimit: 40,
        weatherConditions: ['任何天气'],
        accessRestrictions: []
      }
    },
    algorithm: {
      type: 'a_star',
      parameters: {
        heuristic: 'euclidean'
      },
      weights: {
        distance: 0.2,
        time: 0.6,
        energy: 0.1,
        safety: 0.05,
        efficiency: 0.05
      }
    },
    results: {
      optimizedPath: {
        distance: 0,
        time: 0,
        energy: 0,
        waypoints: [],
        segments: []
      },
      improvements: {
        distanceReduction: 0,
        timeReduction: 0,
        energySaving: 0,
        efficiencyGain: 0
      },
      alternatives: []
    },
    execution: {
      deviations: [],
      performance: {
        accuracy: 0,
        efficiency: 0,
        reliability: 0
      }
    },
    metadata: {
      createdAt: '2024-07-18T02:45:00Z',
      updatedAt: '2024-07-18T02:45:00Z',
      createdBy: '紧急响应系统',
      version: '2.1.0',
      tags: ['紧急巡检', '快速响应', 'B区域'],
      computationTime: 0
    }
  },
  {
    id: 'opt-3',
    name: 'C区域节能巡检路径',
    description: '专注于能耗优化的C区域巡检路径',
    type: 'energy_efficient',
    status: 'completed',
    priority: 'medium',
    scope: {
      area: 'C区域',
      devices: ['robot-03'],
      checkpoints: [
        {
          id: 'cp-9',
          name: '节能起点',
          coordinates: { x: 500, y: 0, z: 0 },
          type: 'start',
          priority: 1,
          estimatedTime: 0,
          requirements: []
        },
        {
          id: 'cp-10',
          name: '低功耗检查点',
          coordinates: { x: 550, y: 100, z: 5 },
          type: 'checkpoint',
          priority: 2,
          estimatedTime: 25,
          requirements: ['低功耗检测']
        },
        {
          id: 'cp-11',
          name: '节能终点',
          coordinates: { x: 500, y: 0, z: 0 },
          type: 'end',
          priority: 1,
          estimatedTime: 0,
          requirements: []
        }
      ],
      constraints: {
        maxDistance: 300,
        maxTime: 60,
        energyLimit: 30,
        weatherConditions: ['晴天'],
        accessRestrictions: ['斜坡区域']
      }
    },
    algorithm: {
      type: 'genetic',
      parameters: {
        populationSize: 50,
        generations: 30,
        mutationRate: 0.05,
        crossoverRate: 0.9
      },
      weights: {
        distance: 0.2,
        time: 0.2,
        energy: 0.5,
        safety: 0.05,
        efficiency: 0.05
      }
    },
    results: {
      originalPath: {
        distance: 280,
        time: 45,
        energy: 28,
        waypoints: [
          { x: 500, y: 0, z: 0 },
          { x: 550, y: 100, z: 5 },
          { x: 500, y: 0, z: 0 }
        ]
      },
      optimizedPath: {
        distance: 260,
        time: 42,
        energy: 22,
        waypoints: [
          { x: 500, y: 0, z: 0 },
          { x: 525, y: 80, z: 3 },
          { x: 550, y: 100, z: 5 },
          { x: 500, y: 0, z: 0 }
        ],
        segments: [
          {
            from: '节能起点',
            to: '中间点',
            distance: 85,
            time: 12,
            energy: 8,
            difficulty: 'easy'
          },
          {
            from: '中间点',
            to: '低功耗检查点',
            distance: 32,
            time: 5,
            energy: 3,
            difficulty: 'easy'
          },
          {
            from: '低功耗检查点',
            to: '节能终点',
            distance: 112,
            time: 15,
            energy: 11,
            difficulty: 'medium'
          }
        ]
      },
      improvements: {
        distanceReduction: 7.1,
        timeReduction: 6.7,
        energySaving: 21.4,
        efficiencyGain: 18.2
      },
      alternatives: [
        {
          id: 'alt-3',
          name: '直线路径',
          score: 72,
          distance: 224,
          time: 38,
          energy: 26,
          pros: ['路径简单', '时间较短'],
          cons: ['能耗较高', '地形限制']
        }
      ]
    },
    execution: {
      startTime: '2024-07-16T15:00:00Z',
      endTime: '2024-07-16T15:42:00Z',
      actualDistance: 262,
      actualTime: 42,
      actualEnergy: 23,
      deviations: [],
      performance: {
        accuracy: 99.2,
        efficiency: 97.8,
        reliability: 98.5
      }
    },
    metadata: {
      createdAt: '2024-07-16T10:00:00Z',
      updatedAt: '2024-07-16T15:45:00Z',
      createdBy: '节能优化系统',
      version: '2.1.0',
      tags: ['节能优化', '地面巡检', 'C区域'],
      computationTime: 8.3
    }
  }
];

function PathOptimization() {
  const [optimizations, setOptimizations] = useState<PathOptimization[]>(mockOptimizations);
  const [selectedOptimization, setSelectedOptimization] = useState<PathOptimization | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // 自动更新优化状态
  useEffect(() => {
    const interval = setInterval(() => {
      setOptimizations(prev => prev.map(opt => {
        if (opt.status === 'optimizing') {
          // 模拟优化进度
          const progress = Math.random();
          if (progress > 0.7) {
            return {
              ...opt,
              status: 'completed',
              metadata: {
                ...opt.metadata,
                computationTime: Math.random() * 30 + 5,
                updatedAt: new Date().toISOString()
              }
            };
          }
        }
        return opt;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 筛选优化记录
  const filteredOptimizations = optimizations.filter(opt => {
    const matchesSearch = opt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opt.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         opt.scope.area.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || opt.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || opt.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'shortest': return Route;
      case 'fastest': return Zap;
      case 'energy_efficient': return Battery;
      case 'balanced': return Target;
      case 'custom': return Settings;
      default: return Route;
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      shortest: '最短路径',
      fastest: '最快路径',
      energy_efficient: '节能路径',
      balanced: '平衡路径',
      custom: '自定义'
    };
    return typeMap[type] || type;
  };

  const getAlgorithmLabel = (algorithm: string) => {
    const algorithmMap: Record<string, string> = {
      genetic: '遗传算法',
      ant_colony: '蚁群算法',
      simulated_annealing: '模拟退火',
      dijkstra: 'Dijkstra算法',
      a_star: 'A*算法',
      hybrid: '混合算法'
    };
    return algorithmMap[algorithm] || algorithm;
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

  const formatDistance = (distance: number) => {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }
    return `${distance}m`;
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 60);
    const minutes = time % 60;
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">路径优化</h1>
          <p className="text-gray-600 mt-1">智能路径规划和优化算法</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            算法配置
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建优化
          </Button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">优化任务</p>
                <p className="text-2xl font-bold">{optimizations.length}</p>
              </div>
              <Route className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均距离节省</p>
                <p className="text-2xl font-bold text-green-600">
                  {(optimizations.filter(o => o.status === 'completed')
                    .reduce((sum, o) => sum + o.results.improvements.distanceReduction, 0) / 
                    optimizations.filter(o => o.status === 'completed').length).toFixed(1)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均时间节省</p>
                <p className="text-2xl font-bold text-purple-600">
                  {(optimizations.filter(o => o.status === 'completed')
                    .reduce((sum, o) => sum + o.results.improvements.timeReduction, 0) / 
                    optimizations.filter(o => o.status === 'completed').length).toFixed(1)}%
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">平均能耗节省</p>
                <p className="text-2xl font-bold text-orange-600">
                  {(optimizations.filter(o => o.status === 'completed')
                    .reduce((sum, o) => sum + o.results.improvements.energySaving, 0) / 
                    optimizations.filter(o => o.status === 'completed').length).toFixed(1)}%
                </p>
              </div>
              <Battery className="h-8 w-8 text-orange-400" />
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
                <Download className="h-4 w-4 mr-2" />
                导出结果
              </Button>
              <Button variant="outline" size="sm">
                <Map className="h-4 w-4 mr-2" />
                地图视图
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
                  placeholder="搜索优化任务名称、描述或区域..."
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
                { value: 'shortest', label: '最短路径' },
                { value: 'fastest', label: '最快路径' },
                { value: 'energy_efficient', label: '节能路径' },
                { value: 'balanced', label: '平衡路径' },
                { value: 'custom', label: '自定义' }
              ]}
            />
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: 'all', label: '全部状态' },
                { value: 'completed', label: '已完成' },
                { value: 'optimizing', label: '优化中' },
                { value: 'draft', label: '草稿' },
                { value: 'failed', label: '失败' },
                { value: 'active', label: '执行中' }
              ]}
            />
          </div>

          {/* 优化表格 */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>优化任务</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>算法</TableHead>
                <TableHead>优化结果</TableHead>
                <TableHead>性能提升</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOptimizations.map((optimization) => {
                const TypeIcon = getTypeIcon(optimization.type);
                return (
                  <TableRow key={optimization.id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <TypeIcon className={`h-5 w-5 ${
                          optimization.status === 'completed' ? 'text-green-500' :
                          optimization.status === 'optimizing' ? 'text-blue-500' :
                          optimization.status === 'active' ? 'text-purple-500' :
                          optimization.status === 'failed' ? 'text-red-500' :
                          'text-gray-400'
                        }`} />
                        <div>
                          <div className="font-medium">{optimization.name}</div>
                          <div className="text-sm text-gray-500">
                            {optimization.scope.area} • {optimization.scope.checkpoints.length} 检查点
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          {getTypeLabel(optimization.type)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getPriorityColor(optimization.priority)}`}>
                          {optimization.priority}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
                        {getAlgorithmLabel(optimization.algorithm.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {optimization.status === 'completed' ? (
                        <div className="text-sm">
                          <div>距离: {formatDistance(optimization.results.optimizedPath.distance)}</div>
                          <div className="text-gray-500">
                            时间: {formatTime(optimization.results.optimizedPath.time)}
                          </div>
                          <div className="text-gray-500">
                            能耗: {optimization.results.optimizedPath.energy}%
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">
                          {optimization.status === 'optimizing' ? '计算中...' : '未完成'}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {optimization.status === 'completed' ? (
                        <div className="text-sm">
                          <div className="text-green-600">
                            距离: -{optimization.results.improvements.distanceReduction.toFixed(1)}%
                          </div>
                          <div className="text-blue-600">
                            时间: -{optimization.results.improvements.timeReduction.toFixed(1)}%
                          </div>
                          <div className="text-orange-600">
                            能耗: -{optimization.results.improvements.energySaving.toFixed(1)}%
                          </div>
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">-</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={optimization.status} />
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{formatRelativeTime(optimization.metadata.createdAt)}</div>
                        <div className="text-gray-500">by {optimization.metadata.createdBy}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedOptimization(optimization);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        {optimization.status === 'completed' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:text-green-700"
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
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

      {/* 优化详情模态框 */}
      {selectedOptimization && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedOptimization(null);
          }}
          title="路径优化详情"
          size="xl"
        >
          <div className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">基本信息</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">任务名称:</span> {selectedOptimization.name}</div>
                  <div><span className="text-gray-500">优化类型:</span> {getTypeLabel(selectedOptimization.type)}</div>
                  <div><span className="text-gray-500">优先级:</span> {selectedOptimization.priority}</div>
                  <div><span className="text-gray-500">状态:</span> {selectedOptimization.status}</div>
                  <div><span className="text-gray-500">目标区域:</span> {selectedOptimization.scope.area}</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">算法配置</h4>
                <div className="space-y-2 text-sm">
                  <div><span className="text-gray-500">算法类型:</span> {getAlgorithmLabel(selectedOptimization.algorithm.type)}</div>
                  <div><span className="text-gray-500">计算时间:</span> {selectedOptimization.metadata.computationTime.toFixed(1)}秒</div>
                  <div><span className="text-gray-500">检查点数:</span> {selectedOptimization.scope.checkpoints.length}</div>
                  <div><span className="text-gray-500">设备数:</span> {selectedOptimization.scope.devices.length}</div>
                  <div><span className="text-gray-500">版本:</span> {selectedOptimization.metadata.version}</div>
                </div>
              </div>
            </div>

            {/* 算法权重 */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">算法权重配置</h4>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(selectedOptimization.algorithm.weights).map(([key, value]) => (
                  <div key={key} className="text-center">
                    <div className="text-sm text-gray-500 mb-1">
                      {key === 'distance' ? '距离' :
                       key === 'time' ? '时间' :
                       key === 'energy' ? '能耗' :
                       key === 'safety' ? '安全' : '效率'}
                    </div>
                    <div className="text-lg font-bold">{(value * 100).toFixed(0)}%</div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${value * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 优化结果对比 */}
            {selectedOptimization.status === 'completed' && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">优化结果对比</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 原始路径 */}
                  {selectedOptimization.results.originalPath && (
                    <div className="p-4 bg-red-50 rounded-lg">
                      <h5 className="font-medium text-red-800 mb-3">原始路径</h5>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>距离:</span>
                          <span className="font-medium">{formatDistance(selectedOptimization.results.originalPath.distance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>时间:</span>
                          <span className="font-medium">{formatTime(selectedOptimization.results.originalPath.time)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>能耗:</span>
                          <span className="font-medium">{selectedOptimization.results.originalPath.energy}%</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 优化路径 */}
                  <div className="p-4 bg-green-50 rounded-lg">
                    <h5 className="font-medium text-green-800 mb-3">优化路径</h5>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>距离:</span>
                        <span className="font-medium">{formatDistance(selectedOptimization.results.optimizedPath.distance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>时间:</span>
                        <span className="font-medium">{formatTime(selectedOptimization.results.optimizedPath.time)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>能耗:</span>
                        <span className="font-medium">{selectedOptimization.results.optimizedPath.energy}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 改进指标 */}
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-3">改进指标</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-blue-50 rounded-lg text-center">
                      <div className="text-blue-600 font-medium">距离节省</div>
                      <div className="text-2xl font-bold text-blue-800">
                        {selectedOptimization.results.improvements.distanceReduction.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg text-center">
                      <div className="text-green-600 font-medium">时间节省</div>
                      <div className="text-2xl font-bold text-green-800">
                        {selectedOptimization.results.improvements.timeReduction.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg text-center">
                      <div className="text-orange-600 font-medium">能耗节省</div>
                      <div className="text-2xl font-bold text-orange-800">
                        {selectedOptimization.results.improvements.energySaving.toFixed(1)}%
                      </div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg text-center">
                      <div className="text-purple-600 font-medium">效率提升</div>
                      <div className="text-2xl font-bold text-purple-800">
                        {selectedOptimization.results.improvements.efficiencyGain.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 路径段详情 */}
            {selectedOptimization.status === 'completed' && selectedOptimization.results.optimizedPath.segments.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">路径段详情</h4>
                <div className="space-y-2">
                  {selectedOptimization.results.optimizedPath.segments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-medium">{segment.from} → {segment.to}</div>
                          <div className="text-sm text-gray-500">
                            难度: {segment.difficulty === 'easy' ? '简单' : segment.difficulty === 'medium' ? '中等' : '困难'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div>{formatDistance(segment.distance)}</div>
                        <div className="text-gray-500">{formatTime(segment.time)}</div>
                        <div className="text-gray-500">{segment.energy}% 能耗</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 备选方案 */}
            {selectedOptimization.status === 'completed' && selectedOptimization.results.alternatives.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">备选方案</h4>
                <div className="space-y-3">
                  {selectedOptimization.results.alternatives.map((alt) => (
                    <div key={alt.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-medium">{alt.name}</h5>
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                          评分: {alt.score}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-500">距离:</span>
                          <span className="ml-2 font-medium">{formatDistance(alt.distance)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">时间:</span>
                          <span className="ml-2 font-medium">{formatTime(alt.time)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">能耗:</span>
                          <span className="ml-2 font-medium">{alt.energy}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-green-600 font-medium">优点:</span>
                          <ul className="text-gray-600 ml-4 mt-1">
                            {alt.pros.map((pro, index) => (
                              <li key={index} className="list-disc">{pro}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <span className="text-red-600 font-medium">缺点:</span>
                          <ul className="text-gray-600 ml-4 mt-1">
                            {alt.cons.map((con, index) => (
                              <li key={index} className="list-disc">{con}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 执行性能 */}
            {selectedOptimization.execution.startTime && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">执行性能</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">执行统计</h5>
                    <div className="space-y-2 text-sm">
                      <div><span className="text-gray-500">开始时间:</span> {new Date(selectedOptimization.execution.startTime).toLocaleString('zh-CN')}</div>
                      {selectedOptimization.execution.endTime && (
                        <div><span className="text-gray-500">结束时间:</span> {new Date(selectedOptimization.execution.endTime).toLocaleString('zh-CN')}</div>
                      )}
                      {selectedOptimization.execution.actualDistance && (
                        <div><span className="text-gray-500">实际距离:</span> {formatDistance(selectedOptimization.execution.actualDistance)}</div>
                      )}
                      {selectedOptimization.execution.actualTime && (
                        <div><span className="text-gray-500">实际时间:</span> {formatTime(selectedOptimization.execution.actualTime)}</div>
                      )}
                      {selectedOptimization.execution.actualEnergy && (
                        <div><span className="text-gray-500">实际能耗:</span> {selectedOptimization.execution.actualEnergy}%</div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">性能指标</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">准确性:</span>
                        <span className="text-sm font-medium">{selectedOptimization.execution.performance.accuracy.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">效率:</span>
                        <span className="text-sm font-medium">{selectedOptimization.execution.performance.efficiency.toFixed(1)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">可靠性:</span>
                        <span className="text-sm font-medium">{selectedOptimization.execution.performance.reliability.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 偏差记录 */}
                {selectedOptimization.execution.deviations.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">路径偏差</h5>
                    <div className="space-y-2">
                      {selectedOptimization.execution.deviations.map((deviation, index) => (
                        <div key={index} className="p-2 bg-yellow-50 rounded border-l-4 border-yellow-400">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium text-sm">{deviation.point}</div>
                              <div className="text-xs text-gray-600">{deviation.reason}</div>
                              <div className="text-xs text-gray-500">{deviation.impact}</div>
                            </div>
                            <div className="text-xs text-gray-400">
                              {formatRelativeTime(deviation.timestamp)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <ModalFooter>
            <Button variant="outline" onClick={() => setShowDetailModal(false)}>
              关闭
            </Button>
            <div className="flex space-x-2">
              {selectedOptimization.status === 'completed' && (
                <>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    导出
                  </Button>
                  <Button>
                    <Play className="h-4 w-4 mr-2" />
                    执行路径
                  </Button>
                </>
              )}
              <Button variant="outline">
                <Map className="h-4 w-4 mr-2" />
                地图查看
              </Button>
            </div>
          </ModalFooter>
        </Modal>
      )}
    </div>
  );
}

export default PathOptimization;
