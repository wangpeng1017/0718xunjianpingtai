import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  Square,
  MapPin,
  Clock,
  Activity,
  Zap,
  Thermometer,
  Battery,
  Wifi,
  Camera,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Settings,
  RefreshCw,
  Maximize2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { formatRelativeTime } from '../../lib/utils';

// 执行跟踪数据类型定义
interface ExecutionTracking {
  id: string;
  taskId: string;
  taskName: string;
  deviceId: string;
  deviceName: string;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'emergency_stop';
  startTime: string;
  currentTime: string;
  estimatedEndTime: string;
  progress: number;
  currentLocation: {
    lat: number;
    lng: number;
    altitude: number;
    accuracy: number;
  };
  currentTarget: {
    id: string;
    name: string;
    eta: string; // 预计到达时间
    distance: number; // 距离（米）
  };
  deviceMetrics: {
    battery: number;
    temperature: number;
    signalStrength: number;
    cpuUsage: number;
    memoryUsage: number;
    storageUsage: number;
  };
  sensorData: {
    timestamp: string;
    camera: {
      status: 'active' | 'inactive' | 'error';
      resolution: string;
      frameRate: number;
    };
    thermal: {
      status: 'active' | 'inactive' | 'error';
      temperature: number;
      range: string;
    };
    lidar: {
      status: 'active' | 'inactive' | 'error';
      range: number;
      accuracy: number;
    };
    gps: {
      status: 'active' | 'inactive' | 'error';
      satellites: number;
      accuracy: number;
    };
  };
  alerts: {
    id: string;
    type: 'warning' | 'error' | 'critical';
    message: string;
    timestamp: string;
    acknowledged: boolean;
  }[];
  path: {
    lat: number;
    lng: number;
    timestamp: string;
  }[];
  checkpoints: {
    id: string;
    name: string;
    status: 'pending' | 'approaching' | 'arrived' | 'completed' | 'skipped';
    estimatedTime: string;
    actualTime?: string;
    duration?: number;
  }[];
}

// Mock数据
const mockExecutionData: ExecutionTracking[] = [
  {
    id: 'exec-1',
    taskId: 'task-001',
    taskName: '主变压器A1日常巡检',
    deviceId: 'device-1',
    deviceName: '巡检无人机-01',
    status: 'running',
    startTime: '2024-07-17T09:00:00Z',
    currentTime: '2024-07-17T09:20:00Z',
    estimatedEndTime: '2024-07-17T09:30:00Z',
    progress: 67,
    currentLocation: {
      lat: 39.9042,
      lng: 116.4074,
      altitude: 15.5,
      accuracy: 2.1
    },
    currentTarget: {
      id: 'target-1',
      name: '主变压器A1',
      eta: '2024-07-17T09:25:00Z',
      distance: 25
    },
    deviceMetrics: {
      battery: 78,
      temperature: 42,
      signalStrength: 85,
      cpuUsage: 45,
      memoryUsage: 62,
      storageUsage: 34
    },
    sensorData: {
      timestamp: '2024-07-17T09:20:00Z',
      camera: {
        status: 'active',
        resolution: '4K',
        frameRate: 30
      },
      thermal: {
        status: 'active',
        temperature: 68.5,
        range: '-20°C to 150°C'
      },
      lidar: {
        status: 'active',
        range: 100,
        accuracy: 0.1
      },
      gps: {
        status: 'active',
        satellites: 12,
        accuracy: 2.1
      }
    },
    alerts: [
      {
        id: 'alert-1',
        type: 'warning',
        message: '发现轻微油渍，建议关注',
        timestamp: '2024-07-17T09:15:00Z',
        acknowledged: false
      }
    ],
    path: [
      { lat: 39.9040, lng: 116.4072, timestamp: '2024-07-17T09:00:00Z' },
      { lat: 39.9041, lng: 116.4073, timestamp: '2024-07-17T09:10:00Z' },
      { lat: 39.9042, lng: 116.4074, timestamp: '2024-07-17T09:20:00Z' }
    ],
    checkpoints: [
      {
        id: 'cp-1',
        name: '外观检查',
        status: 'completed',
        estimatedTime: '2024-07-17T09:05:00Z',
        actualTime: '2024-07-17T09:05:00Z',
        duration: 5
      },
      {
        id: 'cp-2',
        name: '温度检测',
        status: 'completed',
        estimatedTime: '2024-07-17T09:15:00Z',
        actualTime: '2024-07-17T09:15:00Z',
        duration: 8
      },
      {
        id: 'cp-3',
        name: '声音检测',
        status: 'approaching',
        estimatedTime: '2024-07-17T09:25:00Z'
      },
      {
        id: 'cp-4',
        name: '最终检查',
        status: 'pending',
        estimatedTime: '2024-07-17T09:30:00Z'
      }
    ]
  },
  {
    id: 'exec-2',
    taskId: 'task-002',
    taskName: '冷却塔紧急检查',
    deviceId: 'device-2',
    deviceName: '巡检机器人-02',
    status: 'paused',
    startTime: '2024-07-17T08:00:00Z',
    currentTime: '2024-07-17T09:20:00Z',
    estimatedEndTime: '2024-07-17T09:45:00Z',
    progress: 45,
    currentLocation: {
      lat: 39.9052,
      lng: 116.4084,
      altitude: 0,
      accuracy: 1.5
    },
    currentTarget: {
      id: 'target-2',
      name: '冷却塔区域',
      eta: '2024-07-17T09:30:00Z',
      distance: 0
    },
    deviceMetrics: {
      battery: 92,
      temperature: 38,
      signalStrength: 92,
      cpuUsage: 35,
      memoryUsage: 48,
      storageUsage: 67
    },
    sensorData: {
      timestamp: '2024-07-17T09:20:00Z',
      camera: {
        status: 'active',
        resolution: '1080p',
        frameRate: 25
      },
      thermal: {
        status: 'error',
        temperature: 0,
        range: '-20°C to 150°C'
      },
      lidar: {
        status: 'active',
        range: 50,
        accuracy: 0.05
      },
      gps: {
        status: 'active',
        satellites: 10,
        accuracy: 1.5
      }
    },
    alerts: [
      {
        id: 'alert-2',
        type: 'error',
        message: '热成像传感器故障，需要检修',
        timestamp: '2024-07-17T08:30:00Z',
        acknowledged: false
      },
      {
        id: 'alert-3',
        type: 'critical',
        message: '检测到异常振动，建议立即停机检查',
        timestamp: '2024-07-17T09:00:00Z',
        acknowledged: true
      }
    ],
    path: [
      { lat: 39.9050, lng: 116.4082, timestamp: '2024-07-17T08:00:00Z' },
      { lat: 39.9051, lng: 116.4083, timestamp: '2024-07-17T08:30:00Z' },
      { lat: 39.9052, lng: 116.4084, timestamp: '2024-07-17T09:00:00Z' }
    ],
    checkpoints: [
      {
        id: 'cp-5',
        name: '振动检测',
        status: 'completed',
        estimatedTime: '2024-07-17T08:15:00Z',
        actualTime: '2024-07-17T08:20:00Z',
        duration: 15
      },
      {
        id: 'cp-6',
        name: '温度检测',
        status: 'completed',
        estimatedTime: '2024-07-17T08:45:00Z',
        actualTime: '2024-07-17T09:00:00Z',
        duration: 20
      },
      {
        id: 'cp-7',
        name: '水质检测',
        status: 'pending',
        estimatedTime: '2024-07-17T09:30:00Z'
      }
    ]
  }
];

function ExecutionTracking() {
  const [executions, setExecutions] = useState<ExecutionTracking[]>(mockExecutionData);
  const [selectedExecution, setSelectedExecution] = useState<ExecutionTracking | null>(executions[0]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // 自动刷新数据
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setExecutions(prev => prev.map(exec => ({
        ...exec,
        currentTime: new Date().toISOString(),
        progress: Math.min(exec.progress + Math.random() * 2, 100),
        deviceMetrics: {
          ...exec.deviceMetrics,
          battery: Math.max(exec.deviceMetrics.battery - Math.random() * 0.5, 0),
          temperature: exec.deviceMetrics.temperature + (Math.random() - 0.5) * 2,
          cpuUsage: Math.max(0, Math.min(100, exec.deviceMetrics.cpuUsage + (Math.random() - 0.5) * 10))
        }
      })));
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const handleTaskControl = (executionId: string, action: 'pause' | 'resume' | 'stop') => {
    setExecutions(executions.map(exec => {
      if (exec.id === executionId) {
        switch (action) {
          case 'pause':
            return { ...exec, status: 'paused' };
          case 'resume':
            return { ...exec, status: 'running' };
          case 'stop':
            return { ...exec, status: 'emergency_stop' };
          default:
            return exec;
        }
      }
      return exec;
    }));
  };

  const acknowledgeAlert = (executionId: string, alertId: string) => {
    setExecutions(executions.map(exec => {
      if (exec.id === executionId) {
        return {
          ...exec,
          alerts: exec.alerts.map(alert => 
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          )
        };
      }
      return exec;
    }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return Play;
      case 'paused': return Pause;
      case 'completed': return CheckCircle;
      case 'failed': return XCircle;
      case 'emergency_stop': return Square;
      default: return Clock;
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical': return XCircle;
      case 'error': return AlertTriangle;
      case 'warning': return AlertTriangle;
      default: return AlertTriangle;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'error': return 'text-orange-600 bg-orange-50';
      case 'warning': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getSensorStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'inactive': return 'text-gray-400';
      case 'error': return 'text-red-600';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">执行跟踪</h1>
          <p className="text-gray-600 mt-1">实时监控任务执行过程和设备状态</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 text-green-600' : ''}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? '自动刷新' : '手动刷新'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：任务列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>执行中的任务</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-2">
                {executions.map((execution) => {
                  const StatusIcon = getStatusIcon(execution.status);
                  return (
                    <div
                      key={execution.id}
                      className={`p-4 cursor-pointer border-l-4 hover:bg-gray-50 ${
                        selectedExecution?.id === execution.id
                          ? 'bg-blue-50 border-blue-500'
                          : 'border-transparent'
                      }`}
                      onClick={() => setSelectedExecution(execution)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <StatusIcon className={`h-5 w-5 ${
                            execution.status === 'running' ? 'text-green-500' :
                            execution.status === 'paused' ? 'text-yellow-500' :
                            execution.status === 'emergency_stop' ? 'text-red-500' :
                            'text-gray-400'
                          }`} />
                          <div>
                            <div className="font-medium text-sm">{execution.taskName}</div>
                            <div className="text-xs text-gray-500">{execution.deviceName}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{execution.progress}%</div>
                          <div className="text-xs text-gray-500">
                            {execution.alerts.filter(a => !a.acknowledged).length > 0 && (
                              <span className="text-red-500">
                                {execution.alerts.filter(a => !a.acknowledged).length} 警告
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full ${
                              execution.status === 'running' ? 'bg-green-500' :
                              execution.status === 'paused' ? 'bg-yellow-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${execution.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：详细信息 */}
        <div className="lg:col-span-2 space-y-6">
          {selectedExecution && (
            <>
              {/* 任务控制 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{selectedExecution.taskName}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        设备: {selectedExecution.deviceName} • 
                        开始时间: {formatRelativeTime(selectedExecution.startTime)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {selectedExecution.status === 'running' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTaskControl(selectedExecution.id, 'pause')}
                          >
                            <Pause className="h-4 w-4 mr-2" />
                            暂停
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleTaskControl(selectedExecution.id, 'stop')}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Square className="h-4 w-4 mr-2" />
                            停止
                          </Button>
                        </>
                      )}
                      {selectedExecution.status === 'paused' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleTaskControl(selectedExecution.id, 'resume')}
                        >
                          <Play className="h-4 w-4 mr-2" />
                          继续
                        </Button>
                      )}
                      <StatusBadge status={selectedExecution.status} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm text-gray-500">当前位置</div>
                      <div className="flex items-center mt-1">
                        <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                        <span className="text-sm">
                          {selectedExecution.currentLocation.lat.toFixed(4)}, 
                          {selectedExecution.currentLocation.lng.toFixed(4)}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">当前目标</div>
                      <div className="text-sm font-medium mt-1">
                        {selectedExecution.currentTarget.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        距离: {selectedExecution.currentTarget.distance}m
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">预计完成</div>
                      <div className="text-sm font-medium mt-1">
                        {formatRelativeTime(selectedExecution.estimatedEndTime)}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>执行进度</span>
                      <span>{selectedExecution.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${selectedExecution.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 设备状态 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>设备状态</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-3">
                        <Battery className={`h-5 w-5 ${
                          selectedExecution.deviceMetrics.battery > 70 ? 'text-green-500' :
                          selectedExecution.deviceMetrics.battery > 30 ? 'text-yellow-500' :
                          'text-red-500'
                        }`} />
                        <div>
                          <div className="text-sm text-gray-500">电池电量</div>
                          <div className="font-medium">{selectedExecution.deviceMetrics.battery}%</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Thermometer className={`h-5 w-5 ${
                          selectedExecution.deviceMetrics.temperature < 50 ? 'text-green-500' :
                          selectedExecution.deviceMetrics.temperature < 70 ? 'text-yellow-500' :
                          'text-red-500'
                        }`} />
                        <div>
                          <div className="text-sm text-gray-500">设备温度</div>
                          <div className="font-medium">{selectedExecution.deviceMetrics.temperature}°C</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Wifi className={`h-5 w-5 ${
                          selectedExecution.deviceMetrics.signalStrength > 70 ? 'text-green-500' :
                          selectedExecution.deviceMetrics.signalStrength > 30 ? 'text-yellow-500' :
                          'text-red-500'
                        }`} />
                        <div>
                          <div className="text-sm text-gray-500">信号强度</div>
                          <div className="font-medium">{selectedExecution.deviceMetrics.signalStrength}%</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Activity className={`h-5 w-5 ${
                          selectedExecution.deviceMetrics.cpuUsage < 70 ? 'text-green-500' :
                          selectedExecution.deviceMetrics.cpuUsage < 90 ? 'text-yellow-500' :
                          'text-red-500'
                        }`} />
                        <div>
                          <div className="text-sm text-gray-500">CPU使用率</div>
                          <div className="font-medium">{selectedExecution.deviceMetrics.cpuUsage}%</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">传感器状态</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center space-x-3">
                          <Camera className={`h-5 w-5 ${getSensorStatusColor(selectedExecution.sensorData.camera.status)}`} />
                          <div>
                            <div className="text-sm text-gray-500">摄像头</div>
                            <div className="font-medium">{selectedExecution.sensorData.camera.resolution}</div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Thermometer className={`h-5 w-5 ${getSensorStatusColor(selectedExecution.sensorData.thermal.status)}`} />
                          <div>
                            <div className="text-sm text-gray-500">热成像</div>
                            <div className="font-medium">
                              {selectedExecution.sensorData.thermal.status === 'active'
                                ? `${selectedExecution.sensorData.thermal.temperature}°C`
                                : selectedExecution.sensorData.thermal.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Zap className={`h-5 w-5 ${getSensorStatusColor(selectedExecution.sensorData.lidar.status)}`} />
                          <div>
                            <div className="text-sm text-gray-500">激光雷达</div>
                            <div className="font-medium">
                              {selectedExecution.sensorData.lidar.status === 'active'
                                ? `${selectedExecution.sensorData.lidar.range}m`
                                : selectedExecution.sensorData.lidar.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <MapPin className={`h-5 w-5 ${getSensorStatusColor(selectedExecution.sensorData.gps.status)}`} />
                          <div>
                            <div className="text-sm text-gray-500">GPS</div>
                            <div className="font-medium">
                              {selectedExecution.sensorData.gps.status === 'active'
                                ? `精度 ${selectedExecution.sensorData.gps.accuracy}m`
                                : selectedExecution.sensorData.gps.status}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 检查点进度 */}
                <Card>
                  <CardHeader>
                    <CardTitle>检查点进度</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {selectedExecution.checkpoints.map((checkpoint, index) => (
                        <div key={checkpoint.id} className="relative">
                          {index < selectedExecution.checkpoints.length - 1 && (
                            <div className="absolute left-2.5 top-6 bottom-0 w-0.5 bg-gray-200" />
                          )}
                          <div className="flex items-start space-x-3">
                            <div className={`mt-1 w-5 h-5 rounded-full flex items-center justify-center ${
                              checkpoint.status === 'completed' ? 'bg-green-100' :
                              checkpoint.status === 'approaching' ? 'bg-yellow-100' :
                              checkpoint.status === 'arrived' ? 'bg-blue-100' :
                              'bg-gray-100'
                            }`}>
                              <div className={`w-2.5 h-2.5 rounded-full ${
                                checkpoint.status === 'completed' ? 'bg-green-500' :
                                checkpoint.status === 'approaching' ? 'bg-yellow-500' :
                                checkpoint.status === 'arrived' ? 'bg-blue-500' :
                                'bg-gray-300'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div className="font-medium">{checkpoint.name}</div>
                                <StatusBadge status={checkpoint.status} />
                              </div>
                              <div className="text-sm text-gray-500 mt-1">
                                {checkpoint.status === 'completed' ? (
                                  <div className="flex items-center justify-between">
                                    <span>完成时间: {formatRelativeTime(checkpoint.actualTime || '')}</span>
                                    <span>耗时: {checkpoint.duration}分钟</span>
                                  </div>
                                ) : (
                                  <div>预计时间: {formatRelativeTime(checkpoint.estimatedTime)}</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* 警报和地图 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 警报列表 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>警报信息</CardTitle>
                      <div className="text-sm text-gray-500">
                        {selectedExecution.alerts.filter(a => !a.acknowledged).length} 未处理
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {selectedExecution.alerts.length > 0 ? (
                      <div className="space-y-3">
                        {selectedExecution.alerts.map((alert) => {
                          const AlertIcon = getAlertIcon(alert.type);
                          return (
                            <div
                              key={alert.id}
                              className={`p-3 rounded-lg flex items-start space-x-3 ${getAlertColor(alert.type)} ${
                                alert.acknowledged ? 'opacity-60' : ''
                              }`}
                            >
                              <AlertIcon className="h-5 w-5 mt-0.5" />
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div className="font-medium">{alert.message}</div>
                                  {!alert.acknowledged && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => acknowledgeAlert(selectedExecution.id, alert.id)}
                                      className="text-xs"
                                    >
                                      确认
                                    </Button>
                                  )}
                                </div>
                                <div className="text-sm mt-1">
                                  {formatRelativeTime(alert.timestamp)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-400" />
                        <p>暂无警报信息</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 地图视图 */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>位置跟踪</CardTitle>
                      <Button variant="ghost" size="sm">
                        <Maximize2 className="h-4 w-4 mr-2" />
                        全屏
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                      <MapPin className="h-8 w-8 mx-auto mb-2 text-blue-400" />
                      <p className="text-gray-500">地图视图功能开发中...</p>
                      <p className="text-sm text-gray-400 mt-2">将显示设备实时位置和移动轨迹</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExecutionTracking;
